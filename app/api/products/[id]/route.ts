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
    const body = await request.json()
    const {
      name,
      description,
      technicalInfo,
      image,
      images,
      categoryId,
      price,
      brand,
      rating,
      features,
      specifications,
      installmentCount,
      installmentAmount,
    } = body
    const parsedCount = Number.parseInt(String(installmentCount ?? 0), 10)
    const parsedAmount = Number.parseFloat(String(installmentAmount ?? 0))
    const normalizedInstallmentCount = Number.isNaN(parsedCount) || parsedCount <= 0 ? 12 : parsedCount
    const normalizedInstallmentAmount = Number.isNaN(parsedAmount) || parsedAmount <= 0 ? 0 : parsedAmount
    const updated = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        technicalInfo,
        image,
        images,
        categoryId,
        price,
        brand,
        rating,
        features,
        specifications,
        installmentCount: normalizedInstallmentCount,
        installmentAmount: normalizedInstallmentAmount,
      },
    })
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
    await prisma.product.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
