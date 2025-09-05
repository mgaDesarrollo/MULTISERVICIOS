import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
  // admin
  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: { username: "admin", password: "admin" },
  })

  // categories
  const categories = ["cocina", "heladeras", "lavanderia", "tecnologia", "muebles"]
  const createdCats = [] as { id: number; name: string }[]
  for (const name of categories) {
    const cat = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    })
    createdCats.push({ id: cat.id, name: cat.name })
  }

  // sample products
  const findCat = (name: string) => createdCats.find((c) => c.name === name)?.id as number

  await prisma.product.createMany({
    data: [
      {
        name: "Horno Eléctrico Empotrable",
        description:
          "Horno eléctrico de 60cm con convección, grill y 8 funciones de cocción programables.",
        image: "/placeholder.svg?height=200&width=300",
  price: "899.00" as any,
        brand: "Samsung",
        rating: 4.5,
        features: ["Convección", "Grill", "8 Funciones", "Timer Digital"] as any,
        specifications: { Capacidad: "65 litros", Potencia: "3500W" } as any,
        categoryId: findCat("cocina"),
      },
      {
        name: "Heladera Compacta",
        description: "Heladera de 12 pies cúbicos ideal para espacios pequeños, eficiencia A+.",
        image: "/placeholder.svg?height=200&width=300",
  price: "699.00" as any,
        brand: "Whirlpool",
        rating: 4.2,
        features: ["Compacta", "A+ Eficiencia"] as any,
        specifications: { Capacidad: "12 pies³" } as any,
        categoryId: findCat("heladeras"),
      },
    ],
    skipDuplicates: true,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
