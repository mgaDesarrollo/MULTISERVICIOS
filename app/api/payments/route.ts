import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

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

    // Simple allocation: if installmentId provided, apply to that installment
    let appliedPrincipal = 0
    let appliedInterest = 0
    let appliedFees = 0

    const db: any = prisma as any

    if (installmentId) {
      const inst = await db.installment.findUnique({ where: { id: installmentId } })
      if (!inst) return NextResponse.json({ error: "Cuota no encontrada" }, { status: 404 })
      const toCover = Number(inst.totalDue) - Number(inst.amountPaid)
      const pay = Math.min(Number(amount), Math.max(0, toCover))
      // naive split: pay interest first then principal, fees assumed 0 here
      const interestRemaining = Math.max(0, Number(inst.interestDue) - Number(inst.amountPaid))
      const interestPay = Math.min(pay, interestRemaining)
      appliedInterest = interestPay
      const principalPay = pay - interestPay
      appliedPrincipal = principalPay

      await db.installment.update({
        where: { id: inst.id },
        data: {
          amountPaid: (Number(inst.amountPaid) + pay) as any,
          status: (Number(inst.amountPaid) + pay) >= Number(inst.totalDue) ? "PAID" as any : "PARTIAL" as any,
          paidAt: (Number(inst.amountPaid) + pay) >= Number(inst.totalDue) ? new Date() : inst.paidAt,
        },
      })
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
