export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"

export async function POST(request: Request) {
  try {
  const cookieStore = await cookies()
  const isAdmin = Boolean(cookieStore.get("admin_session")?.value)
  if (!isAdmin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    const formData = await request.formData()
    const file = formData.get("file") as unknown as File | null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Basic validation
    const allowed = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"])
    if (!allowed.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 415 })
    }
    // 5MB limit
    // @ts-ignore - size exists on File in web API
    const size = (file as any).size as number
    if (size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 413 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    await mkdir(uploadsDir, { recursive: true })

    const extFromName = (file.name || "").split(".").pop()?.toLowerCase()
    const mimeToExt: Record<string, string> = {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/gif": "gif",
    }
    const extension = (extFromName && extFromName.length <= 5 ? extFromName : mimeToExt[file.type]) || "bin"

    const fileName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${extension}`
    const filePath = path.join(uploadsDir, fileName)
    await writeFile(filePath, buffer)

    const url = `/uploads/${fileName}`
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
