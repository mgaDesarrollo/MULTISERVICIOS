import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  const Schema = z.object({
    name: z.string().trim().min(1),
    description: z.string().optional().or(z.literal("")),
    interestRate: z.coerce.number().min(0),
    installments: z.coerce.number().int().min(1),
  })
  const json = await request.json().catch(() => ({}))
  const parsed = Schema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  try {
    const updated = await prisma.financingMethod.update({ where: { id }, data: parsed.data })
    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  try {
    await prisma.financingMethod.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
