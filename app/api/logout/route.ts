import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  // Eliminar cookie (expirarla inmediatamente)
  res.cookies.set('admin_session', '', { httpOnly: true, path: '/', maxAge: 0 })
  return res
}
