import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function toMoney(n: number) {
  return n.toFixed(2)
}

async function main() {
  const categories = ["cocina", "heladeras", "lavanderia", "tecnologia", "muebles"]
  const createdCats = [] as { id: number; name: string }[]
  for (const name of categories) {
    const cat = await prisma.category.upsert({ where: { name }, update: {}, create: { name } })
    createdCats.push({ id: cat.id, name: cat.name })
  }
  const findCat = (name: string) => createdCats.find((c) => c.name === name)?.id as number

  // Limpiar productos actuales
  await prisma.product.deleteMany({})

  const products: any[] = []

  // Generadores por categoría
  const gen = {
    cocina: (i: number) => {
      const brands = ["Samsung", "Whirlpool", "Electrolux", "Bosch", "Philips", "Beko"]
      const name = [
        "Horno Eléctrico Empotrable",
        "Horno a Gas",
        "Anafe Vitrocerámico",
        "Anafe a Gas",
        "Campana Extractora",
        "Microondas Grill",
      ][i]
      const brand = brands[i]
      const basePrice = 499 + i * 90
      return {
        name: `${name} ${60 + i}cm`,
        description: `${name} con múltiples funciones y acabado premium.`,
        technicalInfo:
          "Norma IRAM. Alimentación 220V~50Hz. Accesorios incluidos según modelo. Manual en español.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder-user.jpg", "/placeholder-logo.png"],
        price: toMoney(basePrice),
        brand,
        rating: 4 + (i % 3) * 0.3,
        features: ["Timer", "Seguridad", "Eficiencia"],
        specifications: {
          Modelo: `CK-${100 + i}`,
          Capacidad: `${55 + i * 2} L`,
          Potencia: `${2500 + i * 200} W`,
          Dimensiones: `${59 + i} x 59 x 56 cm`,
          Color: i % 2 ? "Negro" : "Acero",
          Garantía: "12 meses",
          SKU: `COC-${1000 + i}`,
        },
        categoryId: findCat("cocina"),
      }
    },
    heladeras: (i: number) => {
      const brands = ["Whirlpool", "Samsung", "LG", "Patrick", "Gafa", "GE"]
      const name = [
        "Heladera No Frost",
        "Heladera Cíclica",
        "Heladera Side by Side",
        "Heladera Compacta",
        "Freezer Vertical",
        "Freezer Horizontal",
      ][i]
      const brand = brands[i]
      const basePrice = 699 + i * 120
      return {
        name: `${name} ${300 + i * 20}L`,
        description: `${name} eficiente con estantes de vidrio templado y amplio espacio.`,
        technicalInfo: "Refrigerante R600a. Control electrónico. Bajo ruido.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder-user.jpg"],
        price: toMoney(basePrice),
        brand,
        rating: 4.1 + (i % 4) * 0.2,
        features: ["No Frost", "A+", "Bajo consumo"],
        specifications: {
          Capacidad: `${300 + i * 20} L`,
          Consumo: `${28 + i} kWh/mes`,
          Dimensiones: `${180 + i} x 60 x 65 cm`,
          Color: i % 2 ? "Blanco" : "Plata",
          Garantía: "12 meses",
          Modelo: `HL-${200 + i}`,
        },
        categoryId: findCat("heladeras"),
      }
    },
    lavanderia: (i: number) => {
      const brands = ["LG", "Samsung", "Drean", "Whirlpool", "Electrolux", "Candy"]
      const name = [
        "Lavarropas Automático",
        "Lavarropas Inverter",
        "Lavarropas Carga Superior",
        "Secarropas Centrifugo",
        "Lavasecarropas",
        "Secadora Condensación",
      ][i]
      const brand = brands[i]
      const basePrice = 449 + i * 110
      return {
        name: `${name} ${7 + i} kg`,
        description: `${name} con múltiples programas y alta eficiencia.`,
        technicalInfo: "Entrada 220-240V. Bloqueo para niños. Nivel de ruido reducido.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder.svg"],
        price: toMoney(basePrice),
        brand,
        rating: 4 + (i % 3) * 0.25,
        features: ["Motor Inverter", "Eco Wash", "Rápido 15'"],
        specifications: {
          Capacidad: `${7 + i} kg`,
          RPM: `${1000 + i * 200}`,
          Dimensiones: `85 x 60 x ${55 + i} cm`,
          Color: i % 2 ? "Blanco" : "Plata",
          Garantía: "24 meses",
          Modelo: `LV-${300 + i}`,
        },
        categoryId: findCat("lavanderia"),
      }
    },
    tecnologia: (i: number) => {
      const brands = ["TCL", "Samsung", "LG", "Sony", "Noblex", "Philips"]
      const name = [
        "Smart TV 43\" 4K",
        'Smart TV 50" 4K HDR',
        "Smart TV 55\" 4K",
        "Soundbar 2.1",
        "Monitor 27\" QHD",
        "Notebook 15.6\" i5",
      ][i]
      const brand = brands[i]
      const basePrice = 399 + i * 130
      return {
        name,
        description: `${name} con gran calidad de imagen y conectividad.`,
        technicalInfo: "WiFi, Bluetooth, múltiples puertos, control remoto incluido.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg", "/placeholder-user.jpg"],
        price: toMoney(basePrice),
        brand,
        rating: 4.2 + (i % 3) * 0.2,
        features: ["4K HDR", "Smart", "Bajo consumo"],
        specifications: {
          Resolución: i < 3 ? "3840x2160" : i === 3 ? "2.1ch" : i === 4 ? "2560x1440" : "1920x1080",
          Panel: i < 3 ? "VA 60Hz" : undefined,
          HDMI: i < 3 ? "3x HDMI" : undefined,
          Audio: i === 3 ? "2.1 160W" : "2x10W",
          Modelo: `TC-${400 + i}`,
          Garantía: "12 meses",
        },
        categoryId: findCat("tecnologia"),
      }
    },
    muebles: (i: number) => {
      const brands = ["Genérica", "Genérica", "Genérica", "Genérica", "Genérica", "Genérica"]
      const name = [
        "Juego de Comedor 6 Sillas",
        "Mesa Extensible",
        "Silla Tapizada",
        "Rack para TV",
        "Placard 6 Puertas",
        "Escritorio Gamer",
      ][i]
      const brand = brands[i]
      const basePrice = 199 + i * 150
      return {
        name,
        description: `${name} con materiales resistentes y diseño moderno.`,
        technicalInfo: "Madera tratada. Fácil armado. Manual incluido.",
        image: "/placeholder.jpg",
        images: ["/placeholder.jpg"],
        price: toMoney(basePrice),
        brand,
        rating: 4 + (i % 4) * 0.2,
        features: ["Fácil armado", "Resistente", "Garantía"],
        specifications: {
          Dimensiones: i === 0 ? "Mesa 160x90x75 cm" : "Ver ficha",
          Color: i % 2 ? "Nogal" : "Blanco",
          Garantía: "6 meses",
          Modelo: `MB-${500 + i}`,
        },
        categoryId: findCat("muebles"),
      }
    },
  } as const

  // Crear 6 productos por categoría
  for (const cat of categories) {
    for (let i = 0; i < 6; i++) {
      // @ts-ignore
      products.push(gen[cat](i))
    }
  }

  await prisma.product.createMany({ data: products })
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
