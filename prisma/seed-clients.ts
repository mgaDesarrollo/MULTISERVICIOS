import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

function randomDigits(length: number) {
  let s = ""
  while (s.length < length) s += Math.floor(Math.random() * 10)
  return s.slice(0, length)
}

function uniqueNumbers(count: number, length: number) {
  const set = new Set<string>()
  while (set.size < count) set.add(randomDigits(length))
  return Array.from(set)
}

async function main() {
  // Limpia clientes para entorno de desarrollo
  await prisma.client.deleteMany({})

  const firstNames = [
    "María",
    "Juan",
    "Lucía",
    "Carlos",
    "Sofía",
    "Diego",
    "Valentina",
    "Martín",
    "Camila",
    "Nicolás",
    "Florencia",
    "Agustín",
    "Julián",
    "Paula",
    "Federico",
  ]

  const lastNames = [
    "García",
    "Rodríguez",
    "López",
    "Martínez",
    "González",
    "Pérez",
    "Sánchez",
    "Díaz",
    "Fernández",
    "Romero",
    "Suárez",
    "Acosta",
    "Herrera",
    "Álvarez",
    "Medina",
  ]

  const total = 25
  const dnis = uniqueNumbers(total, 8)
  const cuits = uniqueNumbers(total, 11)

  const clients = Array.from({ length: total }).map((_, i) => {
    const first = firstNames[i % firstNames.length]
    const last = lastNames[(i * 2) % lastNames.length]
    const name = `${first} ${last}`
    const dni = dnis[i]
    const cuit = cuits[i]
    const email = `${first}.${last}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z.]/g, "") + `@example.com`
    const phone = `+54 9 11 ${randomDigits(4)}-${randomDigits(4)}`
    const notes = i % 3 === 0 ? "Cliente con historial de compras." : i % 5 === 0 ? "Prefiere contacto por WhatsApp." : undefined

    return { name, dni, cuit, email, phone, notes }
  })

  await prisma.client.createMany({ data: clients, skipDuplicates: true })

  console.log(`Seeded ${clients.length} clients.`)
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
