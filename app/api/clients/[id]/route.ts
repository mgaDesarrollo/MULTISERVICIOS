import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

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
    const { name, dni, cuit, email, phone, notes } = await request.json()
    const updated = await prisma.client.update({ where: { id }, data: { name, dni, cuit, email, phone, notes } })
    return NextResponse.json(updated)
  } catch (error: any) {
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
