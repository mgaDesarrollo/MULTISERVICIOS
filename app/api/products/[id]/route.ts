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
      financingPlans,
    } = body
    const parsedCount = Number.parseInt(String(installmentCount ?? 0), 10)
    const parsedAmount = Number.parseFloat(String(installmentAmount ?? 0))
    const normalizedInstallmentCount = Number.isNaN(parsedCount) || parsedCount <= 0 ? 12 : parsedCount
    const normalizedInstallmentAmount = Number.isNaN(parsedAmount) || parsedAmount <= 0 ? 0 : parsedAmount
    
    // Delete existing plans and create new ones
    await prisma.productFinancingPlan.deleteMany({ where: { productId: id } })
    
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
        financingPlans: financingPlans && Array.isArray(financingPlans) ? {
          create: financingPlans.map((plan: any) => ({
            installmentCount: Math.max(1, Number.parseInt(String(plan.installmentCount ?? 1), 10)),
            installmentAmount: Math.max(0, Number.parseFloat(String(plan.installmentAmount ?? 0)))
          }))
        } : undefined
      },
      include: {
        financingPlans: {
          orderBy: { installmentCount: "asc" }
        }
      }
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
