import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Middleware de protección básica para rutas de administración.
// Reglas:
// 1. Si la ruta comienza con /admin y no existe la cookie admin_session -> redirigir a /login
// 2. Si ya hay sesión y el usuario intenta ir a /login -> redirigir a /admin (evita re-login)
// 3. Permitir pasar todo lo demás.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = request.cookies.get("admin_session")

  // Protección de /admin
  if (pathname.startsWith("/admin") && !session) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname) // Para posible uso futuro
    return NextResponse.redirect(loginUrl)
  }

  // Evitar que un admin logueado vuelva a /login manualmente
  if (pathname === "/login" && session) {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/login"]
}
