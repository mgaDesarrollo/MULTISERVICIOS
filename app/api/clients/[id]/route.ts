import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { Prisma } from "@prisma/client"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await params
    const id = Number(idStr)
    const client = await prisma.client.findUnique({ where: { id } })
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(client)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id: idStr } = await params
    const id = Number(idStr)
    const Schema = z.object({
      name: z.string().trim().min(1, "El nombre es obligatorio"),
      dni: z.string().trim().optional().or(z.literal("")) .transform((v) => (v ? v : undefined)),
      cuit: z.string().trim().optional().or(z.literal("")) .transform((v) => (v ? v : undefined)),
      email: z.string().email().optional().or(z.literal("")) .transform((v) => (v ? v : undefined)),
      phone: z.string().trim().optional().or(z.literal("")) .transform((v) => (v ? v : undefined)),
      notes: z.string().optional().or(z.literal("")) .transform((v) => (v ? v : undefined)),
    })
    const json = await request.json().catch(() => ({}))
    const parsed = Schema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
    }
    const { name, dni, cuit, email, phone, notes } = parsed.data
    const updated = await prisma.client.update({ where: { id }, data: { name, dni, cuit, email, phone, notes } })
    return NextResponse.json(updated)
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const fields = (error.meta?.target as string[]) || []
      return NextResponse.json({ error: `Duplicado en campos: ${fields.join(", ")}` }, { status: 409 })
    }
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies()
    const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
    if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const { id: idStr } = await params
    const id = Number(idStr)
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
