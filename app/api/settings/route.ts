import { NextResponse } from "next/server"
import { cookies } from "next/headers"

import { prisma } from "@/lib/prisma"
import { toApiPayload } from "@/lib/site-settings"

export async function GET() {
  try {
    const settings = await prisma.siteSetting.findFirst({
      orderBy: { id: "asc" },
    })

    return NextResponse.json(
      toApiPayload({
        phone: settings?.phone,
        email: settings?.email,
        instagram: settings?.instagram,
        facebook: settings?.facebook,
      }),
    )
  } catch (error) {
    console.error("GET /api/settings error", error)
    return NextResponse.json({ error: "No se pudo cargar la configuración" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)

  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const payload = toApiPayload(body)

    const existing = await prisma.siteSetting.findFirst({
      orderBy: { id: "asc" },
    })

    const data = {
      phone: payload.phone || null,
      email: payload.email || null,
      instagram: payload.instagram || null,
      facebook: payload.facebook || null,
    }

    const updated = existing
      ? await prisma.siteSetting.update({ where: { id: existing.id }, data })
      : await prisma.siteSetting.create({ data })

    return NextResponse.json(
      toApiPayload({
        phone: updated.phone,
        email: updated.email,
        instagram: updated.instagram,
        facebook: updated.facebook,
      }),
    )
  } catch (error) {
    console.error("PUT /api/settings error", error)
    return NextResponse.json({ error: "No se pudo actualizar la configuración" }, { status: 500 })
  }
}
