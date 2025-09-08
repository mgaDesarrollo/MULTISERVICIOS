import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  try {
    const sale = await prisma.sale.findUnique({ where: { id }, include: { client: true, financingMethod: true, items: { include: { product: true } } } })
    if (!sale) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json(sale)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const id = Number(params.id)
  if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 })
  try {
    await prisma.sale.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
