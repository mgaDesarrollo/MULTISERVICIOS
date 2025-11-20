"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun, MapPin } from "lucide-react"
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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-black text-white backdrop-blur-xl supports-[backdrop-filter]:bg-black/90 dark:bg-background/80 dark:text-foreground dark:supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 relative">
          <div className="flex-shrink-0">
            <button
              type="button"
              aria-label="Ir al inicio"
              onClick={() => goTo("inicio")}
              className="group flex items-center gap-3 rounded-2xl px-1 py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <div className="relative">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden transition-all duration-500 ease-out">
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-ping opacity-75" />
                  <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-border" />
                  <div className="absolute inset-[3px] rounded-lg bg-black/90 flex items-center justify-center">
                    <div className="relative text-3xl font-black select-none">
                      <span className="relative z-10 bg-gradient-to-b from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg">
                        M
                      </span>
                      <span className="absolute inset-0 text-cyan-400 blur-sm opacity-60 animate-pulse">M</span>
                      <span className="absolute inset-0 text-purple-400 blur-md opacity-40 animate-pulse delay-75">M</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent h-full w-full animate-pulse opacity-60" />
                  </div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-purple-500 rounded-full animate-ping delay-150" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-xl blur-xl transition-all duration-500 group-hover:blur-2xl -z-10" />
              </div>
              <span className="text-lg font-semibold tracking-tight bg-gradient-to-r from-sky-400 via-purple-400 to-pink-500 bg-clip-text text-transparent drop-shadow-sm">
                Multiservicios
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-white/80 dark:text-muted-foreground">
                <MapPin className="h-4 w-4" />
                Córdoba, Argentina
              </span>
            </button>
          </div>

          <nav className="hidden md:block flex-1">
            <div className="flex items-center justify-center space-x-8">
              <button
                onClick={() => goTo("inicio")}
                className="px-3 py-2 text-sm font-medium transition-colors text-white hover:text-secondary dark:text-foreground dark:hover:text-primary"
              >
                Inicio
              </button>
              <button
                onClick={() => goTo("productos")}
                className="px-3 py-2 text-sm font-medium transition-colors text-white/80 hover:text-secondary dark:text-muted-foreground dark:hover:text-primary"
              >
                Productos
              </button>
              <button
                onClick={() => goTo("prestamos")}
                className="px-3 py-2 text-sm font-medium transition-colors text-white/80 hover:text-secondary dark:text-muted-foreground dark:hover:text-primary"
              >
                Préstamos
              </button>
              <button
                onClick={() => goTo("nosotros")}
                className="px-3 py-2 text-sm font-medium transition-colors text-white/80 hover:text-secondary dark:text-muted-foreground dark:hover:text-primary"
              >
                Nosotros
              </button>
              <button
                onClick={() => goTo("contacto")}
                className="px-3 py-2 text-sm font-medium transition-colors text-white/80 hover:text-secondary dark:text-muted-foreground dark:hover:text-primary"
              >
                Contacto
              </button>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-4 w-64 justify-end">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0 text-white hover:text-secondary dark:text-foreground dark:hover:text-primary">
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
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0 text-white hover:text-secondary dark:text-foreground dark:hover:text-primary">
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
