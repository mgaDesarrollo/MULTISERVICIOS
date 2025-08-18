"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setIsMenuOpen(false)
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 border-b border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          <div className="flex-shrink-0">
            <div className="flex items-center group cursor-pointer" onClick={() => scrollToSection("inicio")}>
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary to-primary rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
                  <span className="text-white font-black text-2xl tracking-tighter">M</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-3">
                <span className="text-2xl font-black bg-gradient-to-r from-foreground to-secondary bg-clip-text text-transparent">
                  MULTISERVICIOS
                </span>
                <div className="text-xs text-muted-foreground font-medium tracking-wider">FINANCIERA</div>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button
                onClick={() => scrollToSection("inicio")}
                className="text-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection("productos")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Productos
              </button>
              <button
                onClick={() => scrollToSection("prestamos")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Préstamos para Negocios
              </button>
              <button
                onClick={() => scrollToSection("nosotros")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Nosotros
              </button>
              <button
                onClick={() => scrollToSection("contacto")}
                className="text-muted-foreground hover:text-primary px-3 py-2 text-sm font-medium transition-colors"
              >
                Contacto
              </button>
            </div>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={toggleTheme} className="w-9 h-9 p-0">
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            <Button
              onClick={() => scrollToSection("contacto")}
              className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 px-6 py-2.5"
            >
              Solicitar Asesoría
            </Button>
          </div>

          {/* Mobile menu button */}
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

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card rounded-lg mt-2">
              <button
                onClick={() => scrollToSection("inicio")}
                className="block px-3 py-2 text-base font-medium text-foreground hover:text-primary w-full text-left"
              >
                Inicio
              </button>
              <button
                onClick={() => scrollToSection("productos")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Productos
              </button>
              <button
                onClick={() => scrollToSection("prestamos")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Préstamos para Negocios
              </button>
              <button
                onClick={() => scrollToSection("nosotros")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Nosotros
              </button>
              <button
                onClick={() => scrollToSection("contacto")}
                className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left"
              >
                Contacto
              </button>
              <div className="px-3 py-2">
                <Button
                  onClick={() => scrollToSection("contacto")}
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
