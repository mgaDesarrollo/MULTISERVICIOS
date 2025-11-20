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
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center">
                  <span className="text-secondary-foreground font-bold text-xl">M</span>
                </div>
                <span className="ml-2 text-2xl font-bold">MULTISERVICIOS</span>
              </div>
              <p className="text-primary-foreground/80 mb-6 max-w-md leading-relaxed">
                Somos tu aliado financiero de confianza. Con más de 15 años de experiencia, ayudamos a empresas a crecer
                con soluciones de financiamiento personalizadas y ágiles.
              </p>
              <div className="flex gap-4">
                <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-foreground/10">
                  <Facebook className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-foreground/10">
                  <Linkedin className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-foreground/10">
                  <Twitter className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="sm" className="p-2 hover:bg-primary-foreground/10">
                  <Instagram className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Enlaces Rápidos</h3>
              <ul className="space-y-3">
                <li>
                  <button
                    onClick={() => scrollToSection("inicio")}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Inicio
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("productos")}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Productos
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("nosotros")}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Nosotros
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection("contacto")}
                    className="text-primary-foreground/80 hover:text-primary-foreground transition-colors"
                  >
                    Contacto
                  </button>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="font-semibold text-lg mb-6">Contacto</h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary" />
                  <div className="text-primary-foreground/80">+1 (234) 567-8900</div>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary" />
                  <div className="text-primary-foreground/80">info@multiservicios.com</div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <Separator className="bg-primary-foreground/20" />

        {/* Bottom Footer */}
        <div className="py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-primary-foreground/60 text-sm text-center md:text-left">
              <div className="mb-2">© 2024 MULTISERVICIOS. Todos los derechos reservados.</div>
              <div className="text-xs space-y-1">
                <div>CUIT: 30-12345678-9 | Inscripción AFIP: 12345</div>
                <div>Registro Nacional de Empresas: RNE-2024-001234</div>
                <div>Habilitación Municipal: HM-2024-5678</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-center">
              <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors whitespace-nowrap">
                Política de Privacidad
              </button>
              <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors whitespace-nowrap">
                Términos de Servicio
              </button>
              <button className="text-primary-foreground/60 hover:text-primary-foreground transition-colors whitespace-nowrap">
                Aviso Legal
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
