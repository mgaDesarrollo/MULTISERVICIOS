"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  const goTo = (sectionId: string) => {
    // If we're on home page, smooth scroll; otherwise navigate with hash
    if (pathname === "/") {
      const element = document.getElementById(sectionId)
      if (element) element.scrollIntoView({ behavior: "smooth" })
      else router.push(`/#${sectionId}`)
    } else {
      router.push(`/#${sectionId}`)
    }
    setIsMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 relative">
          <div className="flex-shrink-0 w-64">
            <div className="flex items-center group cursor-pointer" onClick={() => goTo("inicio")}>
              <div className="relative">
                {/* Main logo container with multiple layers */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden group-hover:scale-110 transition-all duration-500 ease-out">
                  {/* Animated background layers */}
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-ping opacity-75"></div>

                  {/* Holographic border effect */}
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-border"></div>
                  <div className="absolute inset-[2px] rounded-lg bg-black/90 flex items-center justify-center">
                    {/* Futuristic M letter */}
                    <div className="relative text-3xl font-black select-none">
                      {/* Main M with gradient */}
                      <span className="relative z-10 bg-gradient-to-b from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent filter drop-shadow-lg">
                        M
                      </span>

                      {/* Glowing outline effect */}
                      <span className="absolute inset-0 text-cyan-400 blur-sm opacity-60 animate-pulse">M</span>

                      {/* Secondary glow */}
                      <span className="absolute inset-0 text-purple-400 blur-md opacity-40 animate-pulse delay-75">
                        M
                      </span>
                    </div>

                    {/* Scanning line effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-full w-full animate-pulse opacity-60"></div>
                  </div>

                  {/* Corner accent lights */}
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-150"></div>

                  {/* Holographic shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse group-hover:animate-ping"></div>
                </div>

                {/* Floating particles */}
                <div className="absolute -top-2 -right-2 w-1 h-1 bg-cyan-400 rounded-full animate-bounce"></div>
                <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-purple-500 rounded-full animate-bounce delay-300"></div>

                {/* Outer glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-xl blur-lg group-hover:blur-xl transition-all duration-500 -z-10"></div>
              </div>
              <div className="ml-3">
                <span className="text-xl font-black bg-gradient-to-r from-foreground via-cyan-400 to-purple-500 bg-clip-text text-transparent">
                  MULTISERVICIOS
                </span>
                <div className="text-xs text-muted-foreground font-medium tracking-wider">Apoyamos el crecimiento de tu negocio</div>
              </div>
            </div>
          </div>

          <nav className="hidden md:block flex-1">
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={() => goTo("inicio")}
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => goTo("productos")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Productos
              </button>
              <button
                onClick={() => goTo("prestamos")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Préstamos
              </button>
              <button
                onClick={() => goTo("nosotros")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Nosotros
              </button>
              <button
                onClick={() => goTo("contacto")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Contacto
              </button>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-4 w-64 justify-end">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              onClick={() => goTo("contacto")}
              className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5"
            >
              Solicitar Asesoría
            </Button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2">
              <button
                onClick={() => goTo("inicio")}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary w-full text-left"
              >
                Inicio
              </button>
              <button
                onClick={() => goTo("productos")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Productos
              </button>
              <button
                onClick={() => goTo("prestamos")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Préstamos
              </button>
              <button
                onClick={() => goTo("nosotros")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Nosotros
              </button>
              <button
                onClick={() => goTo("contacto")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Contacto
              </button>
              <div className="px-3 py-2">
                <Button
                  onClick={() => goTo("contacto")}
                  className="w-full bg-secondary hover:bg-secondary/90"
                >
                  Solicitar Asesoría
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
