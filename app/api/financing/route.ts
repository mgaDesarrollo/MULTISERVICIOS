import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  try {
    const methods = await prisma.financingMethod.findMany({ orderBy: { id: "desc" } })
    return NextResponse.json(methods)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

const Schema = z.object({
  name: z.string().trim().min(1),
  description: z.string().optional().or(z.literal("")),
  interestRate: z.coerce.number().min(0),
  installments: z.coerce.number().int().min(1),
})

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const json = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  const data = parsed.data
  try {
    const created = await prisma.financingMethod.create({ data })
    return NextResponse.json(created)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
