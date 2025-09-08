import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

export async function GET() {
  try {
    const list = await prisma.sale.findMany({
      orderBy: { id: "desc" },
      include: { client: true, financingMethod: true, items: { include: { product: true } } },
    })
    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}

const ItemSchema = z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1), unitPrice: z.number().min(0) })
const BodySchema = z.object({
  clientId: z.number().int().positive(),
  financingMethodId: z.number().int().positive(),
  items: z.array(ItemSchema).min(1),
})

export async function POST(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const json = await request.json().catch(() => ({}))
  const parsed = BodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  const { clientId, financingMethodId, items } = parsed.data

  const subtotal = items.reduce((acc, it) => acc + it.unitPrice * it.quantity, 0)
  const method = await prisma.financingMethod.findUnique({ where: { id: financingMethodId } })
  if (!method) return NextResponse.json({ error: "Método de financiamiento no encontrado" }, { status: 404 })
  const interestAmount = subtotal * (method.interestRate || 0)
  const total = subtotal + interestAmount

  try {
    const created = await prisma.sale.create({
      data: {
        clientId,
        financingMethodId,
        subtotal: String(subtotal) as any,
        interest: String(interestAmount) as any,
        total: String(total) as any,
        items: { createMany: { data: items.map((it) => ({ productId: it.productId, quantity: it.quantity, unitPrice: String(it.unitPrice) as any })) } },
      },
      include: { client: true, financingMethod: true, items: { include: { product: true } } },
    })
    return NextResponse.json(created)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
