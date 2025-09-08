import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = (searchParams.get("q") || "").trim()
    const take = Math.min(Number(searchParams.get("limit") || 0) || 0, 100)
    const skip = Math.max(Number(searchParams.get("offset") || 0) || 0, 0)

    const where = q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { dni: { contains: q, mode: "insensitive" as const } },
            { cuit: { contains: q, mode: "insensitive" as const } },
            { email: { contains: q, mode: "insensitive" as const } },
            { phone: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : undefined

    const res = await prisma.client.findMany({
      where,
      orderBy: { id: "desc" },
      ...(take ? { take } : {}),
      ...(skip ? { skip } : {}),
    })
    return NextResponse.json(res)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

const ClientSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio"),
  dni: z.string().trim().min(1).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  cuit: z.string().trim().min(1).optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  email: z.string().email().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  phone: z.string().trim().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
  notes: z.string().optional().or(z.literal("")).transform((v) => (v ? v : undefined)),
})

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const json = await request.json().catch(() => ({}))
  const parsed = ClientSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const { name, dni, cuit, email, phone, notes } = parsed.data
  try {
    const created = await prisma.client.create({ data: { name, dni, cuit, email, phone, notes } })
    return NextResponse.json(created)
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const fields = (error.meta?.target as string[]) || []
      return NextResponse.json({ error: `Duplicado en campos: ${fields.join(", ")}` }, { status: 409 })
    }
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
