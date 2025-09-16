import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Ensure a client and a financing method exist
  const client = await prisma.client.findFirst() || await prisma.client.create({ data: { name: "Cliente Demo", email: "demo@example.com" } })
  const fm = await prisma.financingMethod.findFirst({ where: { installments: { gt: 1 } }, orderBy: { installments: "asc" } })
    || await prisma.financingMethod.create({ data: { name: "3 cuotas", description: "3 pagos mensuales", interestRate: 0.06, installments: 3 } })

  // Pick some products
  const products = await prisma.product.findMany({ take: 2 })
  if (products.length === 0) {
    console.log("Seed demo: no hay productos, creando uno simple")
    const p = await prisma.product.create({ data: { name: "Producto Demo", price: 100000 as any, category: { create: { name: "Demo" } } } as any })
    products.push(p)
  }
  const items = products.map((p, idx) => ({ productId: p.id, quantity: 1 + idx, unitPrice: Number((p.price as any).toString?.() ?? p.price) }))

  // Create sale via API logic equivalence (simplified): subtotal and no entrega inicial
  const subtotal = items.reduce((a, it) => a + it.unitPrice * it.quantity, 0)

  // Create sale base
  const sale = await prisma.sale.create({
    data: {
      clientId: client.id,
      financingMethodId: fm.id,
      subtotal: String(subtotal) as any,
      downPayment: "0" as any,
      financedAmount: String(subtotal) as any,
      interest: "0" as any,
      total: "0" as any,
      installmentCount: fm.installments,
      appliedRate: fm.interestRate,
      startDate: new Date(),
      status: "ACTIVE" as any,
      items: { createMany: { data: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: String(it.unitPrice) as any })) } },
    },
  }) as any

  // Build French schedule (same math as API)
  const installmentCount = fm.installments
  const totalRate = Math.max(0, fm.interestRate || 0)
  const r = installmentCount > 0 ? totalRate / installmentCount : 0
  const financedAmount = subtotal
  let installmentPayment = 0
  if (r > 0) {
    const pow = Math.pow(1 + r, installmentCount)
    installmentPayment = financedAmount * (r * pow) / (pow - 1)
  } else {
    installmentPayment = financedAmount / installmentCount
  }
  const baseDate = new Date()
  let remaining = financedAmount
  const installmentsData: any[] = []
  for (let i = 0; i < installmentCount; i++) {
    const due = new Date(baseDate)
    due.setMonth(due.getMonth() + (i + 1))
    const interestDueRaw = r > 0 ? remaining * r : 0
    let principalDueRaw = installmentPayment - interestDueRaw
    if (principalDueRaw < 0) principalDueRaw = 0
    let interestDue = Number(interestDueRaw.toFixed(2))
    let principalDue = Number(principalDueRaw.toFixed(2))
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
  await prisma.installment.createMany({ data: installmentsData as any })
  const interestAmount = installmentsData.reduce((a, b) => a + Number(b.interestDue), 0)
  const total = financedAmount + interestAmount
  await prisma.sale.update({ where: { id: sale.id }, data: { interest: String(interestAmount) as any, total: String(total) as any } })

  console.log(`Venta demo creada: #${sale.id} con ${installmentCount} cuotas`)
}

main().finally(() => prisma.$disconnect())
