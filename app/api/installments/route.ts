import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const overdueOnly = searchParams.get('overdueOnly') === '1'
    const dueOn = searchParams.get('dueOn')
    const dueBefore = searchParams.get('dueBefore')
    const take = Math.min(Math.max(Number(searchParams.get('take') || 0), 0), 2000)
    const skip = Math.max(Number(searchParams.get('skip') || 0), 0)

    const where: any = {}
    if (overdueOnly) {
      where.dueDate = { lt: new Date() }
      where.status = { in: ["PENDING", "PARTIAL", "OVERDUE"] as any }
    }
    if (dueOn) {
      const d = new Date(dueOn)
      const start = new Date(d); start.setHours(0,0,0,0)
      const end = new Date(d); end.setHours(23,59,59,999)
      where.dueDate = { gte: start, lte: end }
    }
    if (dueBefore) {
      where.dueDate = { ...(where.dueDate||{}), lt: new Date(dueBefore) }
    }

    const db: any = prisma as any
    const list = await db.installment.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: { sale: { include: { client: true, financingMethod: true } } },
      ...(take ? { take } : {}),
      ...(skip ? { skip } : {}),
    })
    return NextResponse.json(list)
  } catch (error: any) {
    return NextResponse.json({ error: String(error?.message || error) }, { status: 500 })
  }
}
