import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const { username, password } = await request.json()
  try {
    const admin = await prisma.admin.findUnique({ where: { username } })
    if (admin && admin.password === password) {
      // Generar un token simple (en producción usar JWT seguro)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64')
      const response = NextResponse.json({ success: true })
      response.cookies.set('admin_session', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 24,
      })
      return response
  } else {
      return NextResponse.json({ success: false, error: "Credenciales inválidas" }, { status: 401 })
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: String(error?.message || error) }, { status: 500 })
  }
}
