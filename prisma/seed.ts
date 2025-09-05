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

  // Limpieza simple para entorno demo: borra productos existentes
  await prisma.product.deleteMany({})

  // Productos completos
  await prisma.product.createMany({
    data: [
      {
        name: "Horno Eléctrico Empotrable 60cm Convección",
        description:
          "Horno eléctrico empotrable de 60cm con convección, grill, 8 funciones y display táctil.",
        technicalInfo:
          "Norma IRAM. Alimentación 220V~50Hz. Accesorios: bandeja esmaltada, rejilla cromada. Cable 1.2m.",
        image: "/placeholder.jpg",
        images: [
          "/placeholder.jpg",
          "/placeholder-user.jpg",
          "/placeholder-logo.png",
          "/placeholder.svg",
        ] as any,
        price: "899.00" as any,
        brand: "Samsung",
        rating: 4.6,
        features: ["Convección", "Grill", "8 funciones", "Timer digital", "Puerta triple vidrio"] as any,
        specifications: {
          Modelo: "NV60K",
          Capacidad: "65 L",
          Potencia: "3500 W",
          Dimensiones: "59.5 x 59.5 x 56.6 cm",
          Peso: "32 kg",
          Color: "Acero inoxidable",
          Garantía: "12 meses",
          SKU: "HORN-60CNV",
        } as any,
        categoryId: findCat("cocina"),
      },
      {
        name: "Heladera No Frost 360L A+",
        description:
          "Heladera con freezer No Frost de 360 litros, bajo consumo y estantes de vidrio templado.",
        technicalInfo:
          "Refrigerante R600a. Control de temperatura electrónico. Puertas reversibles.",
        image: "/placeholder.jpg",
        images: [
          "/placeholder.jpg",
          "/placeholder-user.jpg",
          "/placeholder-logo.png",
        ] as any,
        price: "1199.00" as any,
        brand: "Whirlpool",
        rating: 4.3,
        features: ["No Frost", "Eficiencia A+", "Bajo ruido"] as any,
        specifications: {
          Capacidad: "360 L",
          Consumo: "30 kWh/mes",
          Dimensiones: "186 x 60 x 65 cm",
          Color: "Plata",
          Garantía: "12 meses",
          Modelo: "WF360NF",
        } as any,
        categoryId: findCat("heladeras"),
      },
      {
        name: "Lavarropas Automático 8 kg Inverter",
        description: "Lavarropas carga frontal 8 kg con motor inverter y 15 programas.",
        technicalInfo: "Entrada 220-240V. Velocidad de centrifugado 1200 rpm. Bloqueo para niños.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.svg"] as any,
        price: "679.00" as any,
        brand: "LG",
        rating: 4.4,
        features: ["Motor Inverter", "15 programas", "Eco Wash"] as any,
        specifications: {
          Capacidad: "8 kg",
          Dimensiones: "85 x 60 x 56 cm",
          Peso: "62 kg",
          Color: "Blanco",
          Garantía: "24 meses",
          Modelo: "F4V308",
        } as any,
        categoryId: findCat("lavanderia"),
      },
      {
        name: 'Smart TV 50" 4K HDR',
        description: "Televisor 50 pulgadas 4K HDR con sistema operativo Google TV.",
        technicalInfo: "WiFi 5, Bluetooth 5.0, 3x HDMI 2.1, 2x USB, sintonizador digital.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder-user.jpg"] as any,
        price: "499.00" as any,
        brand: "TCL",
        rating: 4.5,
        features: ["4K HDR", "Google TV", "HDMI 2.1"] as any,
        specifications: {
          Resolución: "3840x2160",
          Panel: "VA 60Hz",
          HDR: "HDR10/HLG",
          Audio: "2x10W",
          Modelo: "50P635",
          Garantía: "12 meses",
        } as any,
        categoryId: findCat("tecnologia"),
      },
      {
        name: "Juego de Comedor 6 Sillas",
        description: "Mesa rectangular de madera con 6 sillas tapizadas.",
        technicalInfo: "Madera maciza tratada. Tapizado poliéster. Fácil armado.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg"] as any,
        price: "899.00" as any,
        brand: "Genérica",
        rating: 4.1,
        features: ["Madera maciza", "6 sillas", "Fácil armado"] as any,
        specifications: {
          Dimensiones: "Mesa 160x90x75 cm",
          Color: "Nogal",
          Garantía: "6 meses",
          Modelo: "COM6-160",
        } as any,
        categoryId: findCat("muebles"),
      },
    ],
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
