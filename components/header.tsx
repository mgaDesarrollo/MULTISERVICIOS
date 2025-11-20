"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { usePathname, useRouter } from "next/navigation"
import { Space_Grotesk } from "next/font/google"

const markFont = Space_Grotesk({ subsets: ["latin"], weight: ["700"] })

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
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => goTo("inicio")}
              className="group relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-3xl bg-slate-950/85 p-[2px] shadow-[0_12px_30px_-12px_rgba(15,23,42,0.65)] transition-transform duration-300 ease-out hover:scale-105 hover:shadow-[0_20px_46px_-20px_rgba(14,165,233,0.55)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:bg-slate-100"
            >
              <span className="absolute inset-[1px] rounded-[26px] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 dark:from-white dark:via-slate-100 dark:to-white" />
              <span className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 opacity-65 blur-md transition-opacity duration-500 ease-out group-hover:opacity-90" />
              <span className="absolute -inset-10 animate-[spin_8s_linear_infinite] bg-[conic-gradient(from_120deg_at_50%_50%,rgba(14,165,233,0.25)_0deg,transparent_140deg)]" />
              <span className={cn("relative text-4xl lowercase leading-none text-white drop-shadow-lg transition-transform duration-500 group-hover:tracking-tight group-hover:[text-shadow:0_12px_30px_rgba(15,23,42,0.55)] dark:text-slate-900", markFont.className)}>
                m
              </span>
            </button>
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
