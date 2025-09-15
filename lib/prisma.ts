import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL no está definido. Configúralo en variables de entorno (Vercel) o en .env para local.")
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
