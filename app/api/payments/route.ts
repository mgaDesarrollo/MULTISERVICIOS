import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { differenceInCalendarDays } from "date-fns"

const BodySchema = z.object({
  saleId: z.number().int().positive(),
  installmentId: z.number().int().positive().optional(),
  amount: z.number().positive(),
  method: z.enum(["CASH","TRANSFER","CARD","MP","STRIPE","OTHER"]).default("CASH"),
  date: z.string().datetime().optional(),
  reference: z.string().optional(),
  notes: z.string().optional(),
})

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const json = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { saleId, installmentId, amount, method, date, reference, notes } = parsed.data

  try {
    const sale = await prisma.sale.findUnique({ where: { id: saleId } })
    if (!sale) return NextResponse.json({ error: "Venta no encontrada" }, { status: 404 })

  // Allocation order: fees (mora) -> interest -> principal
  let appliedPrincipal = 0
  let appliedInterest = 0
  let appliedFees = 0

    const db: any = prisma as any

    if (installmentId) {
      const inst = await db.installment.findUnique({ where: { id: installmentId } })
      if (!inst) return NextResponse.json({ error: "Cuota no encontrada" }, { status: 404 })
      const today = new Date()
      const due = new Date(inst.dueDate)
      const totalDue = Number(inst.totalDue)
      const amountPaidPrev = Number(inst.amountPaid)
      // Determine prior allocations based on aggregate paid
      const interestDue = Number(inst.interestDue)
      const principalDue = Number(inst.principalDue)
      const interestPaidBefore = Math.min(amountPaidPrev, interestDue)
      const principalPaidBefore = Math.max(0, Math.min(principalDue, amountPaidPrev - interestPaidBefore))
      const feePaidBefore = Math.max(0, amountPaidPrev - interestPaidBefore - principalPaidBefore)
      const piRemaining = Math.max(0, (interestDue - interestPaidBefore) + (principalDue - principalPaidBefore))
      // dynamic mora: apply on outstanding principal+interest if overdue
      const overdueDays = piRemaining > 0 && due < today ? Math.max(0, differenceInCalendarDays(today, due)) : 0
      const dailyRate = 0.001 // 0.1% diario
      const theorFee = Number((piRemaining * dailyRate * overdueDays).toFixed(2))
      const feeRemaining = Math.max(0, theorFee - feePaidBefore)
      // remaining interest and principal now
      const interestRemaining = Math.max(0, interestDue - interestPaidBefore)
      const principalRemaining = Math.max(0, principalDue - principalPaidBefore)

      let remainingPayment = Number(amount)
      // 1) fees
      const feesPay = Math.min(remainingPayment, feeRemaining)
      appliedFees = feesPay
      remainingPayment -= feesPay
      // 2) interest
      const interestPay = Math.min(remainingPayment, interestRemaining)
      appliedInterest = interestPay
      remainingPayment -= interestPay
      // 3) principal
      const principalPay = Math.min(remainingPayment, principalRemaining)
      appliedPrincipal = principalPay
      remainingPayment -= principalPay

      const pay = feesPay + interestPay + principalPay

      await db.installment.update({
        where: { id: inst.id },
        data: {
          // Persist current accrued fee (mora) snapshot
          feeDue: String(theorFee) as any,
          amountPaid: (amountPaidPrev + pay) as any,
          // Consider fees for full payment status
          status: (amountPaidPrev + pay) >= (totalDue + theorFee) ? "PAID" as any : "PARTIAL" as any,
          paidAt: (Number(inst.amountPaid) + pay) >= Number(inst.totalDue) ? new Date() : inst.paidAt,
        },
      })
    } else {
      // Auto-allocate across installments (oldest due first)
      let remainingPayment = Number(amount)
      const today = new Date()
      const installments = await db.installment.findMany({
        where: { saleId },
        orderBy: { dueDate: 'asc' },
      })
      for (const inst of installments) {
        if (remainingPayment <= 0) break
        const due = new Date(inst.dueDate)
        const totalDue = Number(inst.totalDue)
        const amountPaidPrev = Number(inst.amountPaid)
        const interestDue = Number(inst.interestDue)
        const principalDue = Number(inst.principalDue)
        const interestPaidBefore = Math.min(amountPaidPrev, interestDue)
        const principalPaidBefore = Math.max(0, Math.min(principalDue, amountPaidPrev - interestPaidBefore))
        const feePaidBefore = Math.max(0, amountPaidPrev - interestPaidBefore - principalPaidBefore)
        const piRemaining = Math.max(0, (interestDue - interestPaidBefore) + (principalDue - principalPaidBefore))
        const overdueDays = piRemaining > 0 && due < today ? Math.max(0, differenceInCalendarDays(today, due)) : 0
        const dailyRate = 0.001
        const theorFee = Number((piRemaining * dailyRate * overdueDays).toFixed(2))
        const feeRemaining = Math.max(0, theorFee - feePaidBefore)
        const interestRemaining = Math.max(0, interestDue - interestPaidBefore)
        const principalRemaining = Math.max(0, principalDue - principalPaidBefore)

        // fees
        const feesPay = Math.min(remainingPayment, feeRemaining)
        appliedFees += feesPay
        remainingPayment -= feesPay
        // interest
        const interestPay = Math.min(remainingPayment, interestRemaining)
        appliedInterest += interestPay
        remainingPayment -= interestPay
        // principal
        const principalPay = Math.min(remainingPayment, principalRemaining)
        appliedPrincipal += principalPay
        remainingPayment -= principalPay

        const pay = feesPay + interestPay + principalPay
        if (pay > 0) {
          await db.installment.update({
            where: { id: inst.id },
            data: {
              feeDue: String(theorFee) as any,
              amountPaid: (amountPaidPrev + pay) as any,
              status: (amountPaidPrev + pay) >= (totalDue + theorFee) ? 'PAID' : 'PARTIAL',
              paidAt: (Number(inst.amountPaid) + pay) >= Number(inst.totalDue) ? new Date() : inst.paidAt,
            },
          })
        }
      }
    }

    const payment = await db.payment.create({
      data: {
        saleId,
        installmentId: installmentId ?? null,
        amount: String(amount) as any,
        method: method as any,
        date: date ? new Date(date) : new Date(),
        reference,
        notes,
        appliedPrincipal: String(appliedPrincipal) as any,
        appliedInterest: String(appliedInterest) as any,
        appliedFees: String(appliedFees) as any,
      },
    })

    return NextResponse.json(payment)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const start = searchParams.get('start')
    const end = searchParams.get('end')
    const where: any = {}
    if (start || end) {
      where.date = {}
      if (start) where.date.gte = new Date(start)
      if (end) where.date.lte = new Date(end)
    }
    const db: any = prisma as any
    const list = await db.payment.findMany({ where, orderBy: { date: 'desc' }, take: 1000 })
    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
