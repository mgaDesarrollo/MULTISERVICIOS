import {
  PrismaClient,
  SaleStatus,
  InstallmentStatus,
  PaymentMethod,
  type Product,
  type Client,
  type FinancingMethod,
} from "@prisma/client"

type SaleStatusValue = (typeof SaleStatus)[keyof typeof SaleStatus]
type InstallmentStatusValue = (typeof InstallmentStatus)[keyof typeof InstallmentStatus]
type PaymentMethodValue = (typeof PaymentMethod)[keyof typeof PaymentMethod]

const prisma = new PrismaClient()

function money(n: number) {
  return n.toFixed(2)
}

function addMonths(date: Date, months: number) {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d
}

async function ensureBasics(): Promise<{
  products: Product[]
  clients: Client[]
  methods: FinancingMethod[]
}> {
  // Admin
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: "admin" },
  })

  // Categories minimal
  const cat = await prisma.category.upsert({ where: { name: "demo" }, update: {}, create: { name: "demo" } })

  // Product minimal (if not exists any)
  let products = await prisma.product.findMany({ take: 5 })
  if (products.length === 0) {
    const p = await prisma.product.create({
      data: {
        name: "Producto Demo",
        description: "Producto de prueba",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg"],
        price: money(999),
        brand: "Demo",
        rating: 4.5,
        features: ["Demo" as any] as any,
        specifications: { SKU: "DEMO-001" } as any,
        categoryId: cat.id,
      },
    })
    products = [p]
  }

  // Clients minimal
  const existingClients = await prisma.client.findMany({})
  const needed = Math.max(0, 3 - existingClients.length)
  if (needed > 0) {
    for (let i = 0; i < needed; i++) {
      await prisma.client.create({
        data: {
          name: `Cliente Demo ${i + 1}`,
          dni: String(10000000 + i),
          cuit: String(20100000000 + i),
          email: `demo${i + 1}@example.com`,
          phone: "+54 9 11 1111-1111",
        },
      })
    }
  }

  // Financing methods
  const methodsData = [
    { name: "Contado", description: "Pago al contado", interestRate: 0, installments: 1 },
    { name: "3 cuotas", description: "3 pagos mensuales", interestRate: 0.06, installments: 3 },
    { name: "6 cuotas", description: "6 pagos mensuales", interestRate: 0.12, installments: 6 },
    { name: "12 cuotas", description: "12 pagos mensuales", interestRate: 0.24, installments: 12 },
  ]
  for (const m of methodsData) {
    const existing = await prisma.financingMethod.findFirst({ where: { name: m.name } })
    if (existing) await prisma.financingMethod.update({ where: { id: existing.id }, data: m })
    else await prisma.financingMethod.create({ data: m })
  }

  return {
    products: await prisma.product.findMany(),
    clients: await prisma.client.findMany(),
    methods: await prisma.financingMethod.findMany(),
  }
}

function frenchSchedule(principal: number, totalInstallments: number, periodRate: number) {
  const schedule: { principalDue: number; interestDue: number; totalDue: number }[] = []
  if (totalInstallments <= 0) return schedule
  if (periodRate === 0) {
    const p = principal / totalInstallments
    for (let k = 0; k < totalInstallments; k++) schedule.push({ principalDue: p, interestDue: 0, totalDue: p })
    return schedule
  }
  const i = periodRate
  const n = totalInstallments
  const M = principal * (i / (1 - Math.pow(1 + i, -n)))
  let balance = principal
  for (let k = 0; k < n; k++) {
    const interest = balance * i
    const principalPart = Math.max(0, M - interest)
    balance = Math.max(0, balance - principalPart)
    schedule.push({ principalDue: principalPart, interestDue: interest, totalDue: principalPart + interest })
  }
  return schedule
}

async function createSaleWithSchedule(opts: {
  clientId: number
  methodId: number
  items: { productId: number; quantity: number; unitPrice: number }[]
  startDate: Date
  useFrench: boolean
}) {
  const { clientId, methodId, items, startDate, useFrench } = opts
  const method = await prisma.financingMethod.findUniqueOrThrow({ where: { id: methodId } })
  const subtotal = items.reduce((a, it) => a + it.quantity * it.unitPrice, 0)
  const n = Math.max(1, method.installments)

  let schedule: { principalDue: number; interestDue: number; totalDue: number }[] = []
  let totalInterest = 0

  if (useFrench) {
    const monthlyRate = method.interestRate > 0 ? method.interestRate / n : 0
    schedule = frenchSchedule(subtotal, n, monthlyRate)
    totalInterest = schedule.reduce((a, s) => a + s.interestDue, 0)
  } else {
    const interest = subtotal * (method.interestRate || 0)
    totalInterest = interest
    const principalPer = subtotal / n
    const interestPer = interest / n
    schedule = Array.from({ length: n }).map(() => ({ principalDue: principalPer, interestDue: interestPer, totalDue: principalPer + interestPer }))
  }

  const total = subtotal + totalInterest

  const sale = await prisma.sale.create({
    data: {
      clientId,
      financingMethodId: methodId,
      subtotal: money(subtotal) as any,
      downPayment: money(0) as any,
      financedAmount: money(subtotal) as any,
      interest: money(totalInterest) as any,
      total: money(total) as any,
      installmentCount: n,
      appliedRate: method.interestRate,
      startDate,
      status: SaleStatus.ACTIVE,
      items: {
        createMany: {
          data: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: money(it.unitPrice) as any })),
        },
      },
    },
  })

  // Create installments
  const instData = schedule.map((s, idx) => ({
    saleId: sale.id,
    number: idx + 1,
    dueDate: addMonths(startDate, idx + 1),
    principalDue: money(s.principalDue) as any,
    interestDue: money(s.interestDue) as any,
    feeDue: money(0) as any,
    totalDue: money(s.totalDue) as any,
    amountPaid: money(0) as any,
    status: new Date(addMonths(startDate, idx + 1)) < new Date() ? InstallmentStatus.OVERDUE : InstallmentStatus.PENDING,
  }))

  await prisma.installment.createMany({ data: instData })

  return sale
}

async function main() {
  const { products, clients, methods } = await ensureBasics()
  const now = new Date()

  const pickProduct = (i: number) => products[i % products.length]
  const p0 = pickProduct(0)
  const p1 = pickProduct(1)

  // Sale A: cuotas con primera venciendo HOY (startDate hace 1 mes)
  await createSaleWithSchedule({
    clientId: clients[0].id,
    methodId: methods.find((m) => m.installments === 6)?.id || methods[0].id,
    items: [
      { productId: p0.id, quantity: 1, unitPrice: Number((p0.price as any).toString?.() ?? p0.price) },
      { productId: p1.id, quantity: 1, unitPrice: Number((p1.price as any).toString?.() ?? p1.price) },
    ],
    startDate: addMonths(now, -1),
    useFrench: true,
  })

  // Sale B: varias cuotas VENCIDAS (startDate hace 2 meses)
  const saleB = await createSaleWithSchedule({
    clientId: clients[1]?.id ?? clients[0].id,
    methodId: methods.find((m) => m.installments === 12)?.id || methods[0].id,
    items: [ { productId: p0.id, quantity: 1, unitPrice: Number((p0.price as any).toString?.() ?? p0.price) } ],
    startDate: addMonths(now, -2),
    useFrench: true,
  })

  // Registrar un pago parcial sobre la primera cuota de Sale B
  const firstInstB = await prisma.installment.findFirst({ where: { saleId: saleB.id }, orderBy: { number: "asc" } })
  if (firstInstB) {
    const partial = 100
    await prisma.payment.create({
      data: {
        saleId: saleB.id,
        installmentId: firstInstB.id,
        amount: money(partial) as any,
        method: PaymentMethod.CASH as PaymentMethodValue,
        notes: "Pago parcial demo",
      },
    })
    await prisma.installment.update({
      where: { id: firstInstB.id },
      data: {
        amountPaid: money(Number((firstInstB.amountPaid as any).toString?.() ?? firstInstB.amountPaid) + partial) as any,
        status: InstallmentStatus.PARTIAL as InstallmentStatusValue,
      },
    })
  }

  // Sale C: futura (sin vencidas) startDate hoy
  await createSaleWithSchedule({
    clientId: clients[2]?.id ?? clients[0].id,
    methodId: methods.find((m) => m.installments === 3)?.id || methods[0].id,
    items: [ { productId: p1.id, quantity: 1, unitPrice: Number((p1.price as any).toString?.() ?? p1.price) } ],
    startDate: now,
    useFrench: true,
  })

  console.log("Seed demo financing: ventas con cronograma creadas.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
