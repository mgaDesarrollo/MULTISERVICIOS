export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { put } from "@vercel/blob"

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const isAdmin = Boolean(cookieStore.get("admin_session")?.value)

    if (!isAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as unknown as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Basic validation
    const allowed = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/x-webp", "image/gif"])
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 })
    }

    // Upload to Vercel Blob
    // put() automatically uses process.env.BLOB_READ_WRITE_TOKEN
    const blob = await put(file.name, file, {
      access: 'public',
    })

    return NextResponse.json({ url: blob.url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
