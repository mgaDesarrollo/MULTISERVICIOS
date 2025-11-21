"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Facebook, Linkedin, Twitter, Instagram, Mail, Phone } from "lucide-react"

export function Footer() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="bg-gradient-to-br from-neutral-900 via-neutral-950 to-black text-white border-t border-neutral-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-4 sm:mb-6 group">
                <div className="relative">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden transition-all duration-500 ease-out">
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
                <span className="ml-3 text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">MULTISERVICIOS</span>
              </div>
              <p className="text-neutral-400 mb-4 sm:mb-6 max-w-md leading-relaxed text-sm sm:text-base">
                Somos tu aliado financiero de confianza. Con más de 15 años de experiencia, ayudamos a empresas a crecer
                con soluciones de financiamiento personalizadas y ágiles.
              </p>
              <div className="flex gap-3 sm:gap-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-neutral-400 hover:text-cyan-400 transition-colors">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-neutral-400 hover:text-purple-400 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-neutral-400 hover:text-pink-400 transition-colors">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-white/10 text-neutral-400 hover:text-orange-400 transition-colors">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">Enlaces Rápidos</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
                <li>
                  <button
                    onClick={() => scrollToSection("inicio")}
                    className="text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("productos")}
                    className="text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    Productos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("nosotros")}
                    className="text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    Nosotros
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contacto")}
                    className="text-neutral-400 hover:text-cyan-300 transition-colors"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-base sm:text-lg mb-4 sm:mb-6 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">Contacto</h3>
              <ul className="space-y-3 sm:space-y-4 text-sm sm:text-base">
                <li className="flex items-center gap-3">
                  <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 flex-shrink-0" />
                  <div className="text-neutral-400">+1 (234) 567-8900</div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 flex-shrink-0" />
                  <div className="text-neutral-400 break-all">info@multiservicios.com</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-neutral-800" />

        {/* Bottom Footer */}
        <div className="py-6 sm:py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-neutral-500 text-xs sm:text-sm text-center md:text-left">
              <div className="mb-2">© 2024 MULTISERVICIOS. Todos los derechos reservados.</div>
              <div className="text-[10px] sm:text-xs space-y-1 text-neutral-600">
                <div>CUIT: 30-12345678-9 | Inscripción AFIP: 12345</div>
                <div>Registro Nacional de Empresas: RNE-2024-001234</div>
                <div>Habilitación Municipal: HM-2024-5678</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-xs sm:text-sm text-center">
              <button className="text-neutral-500 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Política de Privacidad
              </button>
              <button className="text-neutral-500 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Términos de Servicio
              </button>
              <button className="text-neutral-500 hover:text-cyan-300 transition-colors whitespace-nowrap">
                Aviso Legal
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
