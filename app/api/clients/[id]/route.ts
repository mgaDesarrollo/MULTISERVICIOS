import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    const db: any = prisma as any
    const client: any = await db.client.findUnique({ 
      where: { id },
      include: {
        sales: {
          include: {
            financingMethod: {
              select: { name: true }
            },
            installments: {
              orderBy: { number: 'asc' }
            },
            payments: {
              orderBy: { date: 'desc' }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    
    // Calculate moraTotal across all sales
    const moraTotal = (client.sales || []).reduce((acc: number, s: any) => 
      acc + (s.installments || []).reduce((acc2: number, i: any) => 
        acc2 + Number(i.feeDue || 0), 0), 0)
    
    return NextResponse.json({ ...client, moraTotal: Number(moraTotal.toFixed(2)) })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
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
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
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
  } catch (error: unknown) {
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const target = error.meta?.target
      const fields = Array.isArray(target) ? target : target ? [String(target)] : []
      return NextResponse.json({ error: `Duplicado en campos: ${fields.join(", ")}` }, { status: 409 })
    }
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
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
    const { id: idParam } = await params
    const id = Number(idParam)
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
    await prisma.client.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
