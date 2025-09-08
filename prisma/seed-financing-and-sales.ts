import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // Basic financing methods
  const methodsData = [
    { name: "Contado", description: "Pago al contado", interestRate: 0, installments: 1 },
    { name: "3 cuotas", description: "3 pagos mensuales", interestRate: 0.06, installments: 3 },
    { name: "6 cuotas", description: "6 pagos mensuales", interestRate: 0.12, installments: 6 },
    { name: "12 cuotas", description: "12 pagos mensuales", interestRate: 0.24, installments: 12 },
  ]

  for (const m of methodsData) {
    const existing = await prisma.financingMethod.findFirst({ where: { name: m.name } })
    if (existing) {
      await prisma.financingMethod.update({ where: { id: existing.id }, data: m })
    } else {
      await prisma.financingMethod.create({ data: m })
    }
  }

  const clients = await prisma.client.findMany({ take: 5, orderBy: { id: "asc" } })
  const products = await prisma.product.findMany({ take: 10, orderBy: { id: "asc" } })
  const methods = await prisma.financingMethod.findMany({ orderBy: { id: "asc" } })
  if (clients.length === 0 || products.length === 0 || methods.length === 0) {
    console.warn("Seed: faltan clientes/productos/metodos. Asegúrate de correr los seeds previos.")
    return
  }

  // Create a few sales for the first clients
  for (let i = 0; i < Math.min(5, clients.length); i++) {
    const client = clients[i]
    const method = methods[i % methods.length]
    const itemsCount = Math.max(1, (i % 3) + 1)
    const items = Array.from({ length: itemsCount }).map((_, idx) => {
      const p = products[(i + idx) % products.length]
      const quantity = (idx % 2) + 1
  const unitPrice = Number((p.price as unknown as any)?.toString?.() ?? p.price)
      return { productId: p.id, quantity, unitPrice }
    })

    const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0)
    const interest = subtotal * (method.interestRate || 0)
    const total = subtotal + interest

    await prisma.sale.create({
      data: {
        clientId: client.id,
        financingMethodId: method.id,
        subtotal: String(subtotal) as any,
        interest: String(interest) as any,
        total: String(total) as any,
        items: {
          createMany: {
            data: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: String(it.unitPrice) as any })),
          },
        },
      },
    })
  }

  console.log("Seed: financiamiento y ventas completado.")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
