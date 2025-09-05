"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useTheme } from "next-themes"

export default function LoginPage() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      if (data.success) {
        router.push("/admin")
      } else {
        setError(data.error || "Usuario o contraseña incorrectos")
      }
    } catch (err) {
      setError("Error de conexión")
    }
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background transition-colors duration-300`}> 
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle>Iniciar sesión</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Usuario</Label>
              <Input id="username" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <Button type="submit" className="w-full">Ingresar</Button>
          </form>
          <div className="mt-4 text-center">
            <Button variant="ghost" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Cambiar tema</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
