import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  try {
    const list = await prisma.sale.findMany({
      orderBy: { id: "desc" },
      include: { client: true, financingMethod: true, items: { include: { product: true } } },
    })
    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

const ItemSchema = z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1), unitPrice: z.number().min(0) })
const BodySchema = z.object({
  clientId: z.number().int().positive(),
  financingMethodId: z.number().int().positive(),
  items: z.array(ItemSchema).min(1),
  downPayment: z.number().min(0).optional(),
  startDate: z.string().datetime().optional(),
})

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const json = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { clientId, financingMethodId, items, downPayment = 0, startDate } = parsed.data

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0)
  const method = await prisma.financingMethod.findUnique({ where: { id: financingMethodId } })
  if (!method) return NextResponse.json({ error: "Método de financiamiento no encontrado" }, { status: 404 })
  const cleanDown = Math.max(0, Math.min(downPayment, subtotal))
  const financedAmount = subtotal - cleanDown
  const installmentCount = Math.max(1, method.installments || 1)
  // Método francés (cuota fija) con una tasa periódica derivada (simplificación):
  // r_periodo = tasa_total / número_de_cuotas
  const totalRate = Math.max(0, method.interestRate || 0)
  const r = installmentCount > 0 ? totalRate / installmentCount : 0
  let installmentPayment = 0
  if (r > 0) {
    const pow = Math.pow(1 + r, installmentCount)
    installmentPayment = financedAmount * (r * pow) / (pow - 1)
  } else {
    installmentPayment = financedAmount / installmentCount
  }

  try {
    // Crear venta base
    const db: any = prisma as any
    const sale = await db.sale.create({
      data: {
        clientId,
        financingMethodId,
        subtotal: String(subtotal) as any,
        downPayment: String(cleanDown) as any,
        financedAmount: String(financedAmount) as any,
        interest: String(0) as any,
        total: String(0) as any,
        installmentCount,
        appliedRate: totalRate,
        startDate: startDate ? new Date(startDate) : new Date(),
        status: "ACTIVE" as any,
        items: { createMany: { data: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: String(it.unitPrice) as any })) } },
      },
    })

    // Generar cronograma método francés
    const baseDate = startDate ? new Date(startDate) : new Date()
    let remaining = financedAmount
    const installmentsData: any[] = []
    let accInterest = 0
    for (let i = 0; i < installmentCount; i++) {
      const due = new Date(baseDate)
      due.setMonth(due.getMonth() + (i + 1))
      const interestDueRaw = r > 0 ? remaining * r : 0
      let principalDueRaw = installmentPayment - interestDueRaw
      // Evitar negativos por acumulación de redondeo
      if (principalDueRaw < 0) principalDueRaw = 0
      let interestDue = Number(interestDueRaw.toFixed(2))
      let principalDue = Number(principalDueRaw.toFixed(2))
      accInterest += interestDue
      remaining = Math.max(0, remaining - principalDue)
      const totalDue = Number((principalDue + interestDue).toFixed(2))
      installmentsData.push({
        saleId: sale.id,
        number: i + 1,
        dueDate: due,
        principalDue: String(principalDue) as any,
        interestDue: String(interestDue) as any,
        feeDue: "0" as any,
        totalDue: String(totalDue) as any,
        amountPaid: "0" as any,
        status: "PENDING" as any,
      })
    }
    // Ajustes por redondeo en última cuota
    if (installmentsData.length > 0) {
      const sumP = installmentsData.reduce((a, b) => a + Number(b.principalDue), 0)
      const sumI = installmentsData.reduce((a, b) => a + Number(b.interestDue), 0)
      const dP = Number((financedAmount - sumP).toFixed(2))
      const dI = Number((sumI).toFixed(2)) // sumI ya es la suma usada; recalculamos interés total como suma real
      // Para mantener coherencia total, ajustamos principal y recalculamos total
      const last = installmentsData[installmentsData.length - 1]
      last.principalDue = String((Number(last.principalDue) + dP).toFixed(2)) as any
      last.totalDue = String((Number(last.principalDue) + Number(last.interestDue)).toFixed(2)) as any
    }

    // Recalcular interés total a partir del cronograma construido
    const interestAmount = installmentsData.reduce((a, b) => a + Number(b.interestDue), 0)
    const total = financedAmount + interestAmount

  await db.installment.createMany({ data: installmentsData as any })

    // Actualizar totales calculados por cronograma
  await db.sale.update({ where: { id: sale.id }, data: { interest: String(Number(interestAmount.toFixed(2))) as any, total: String(Number(total.toFixed(2))) as any } })

    const full = await db.sale.findUnique({
      where: { id: sale.id },
      include: {
        client: true,
        financingMethod: true,
        items: { include: { product: true } },
        installments: true,
        payments: true,
      },
    })
    return NextResponse.json(full)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
