import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

if (!process.env.DATABASE_URL) {
  console.warn("⚠️ DATABASE_URL no está definido en el ambiente.")
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: ["error", "warn"],
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
