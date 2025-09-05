import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
  const res = await prisma.product.findMany({ orderBy: { id: "desc" } })
  return NextResponse.json(res)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const { name, description, technicalInfo, image, images, categoryId, price, brand, rating, features, specifications } = await request.json()
  try {
    const created = await prisma.product.create({
      data: { name, description, technicalInfo, image, images, categoryId, price, brand, rating, features, specifications },
    })
    return NextResponse.json(created)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
