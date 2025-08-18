"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, TrendingUp, Shield, Clock, Award } from "lucide-react"

export function HeroSection() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section
      id="inicio"
      className="relative min-h-screen flex items-center bg-gradient-to-br from-background via-background to-secondary/5"
    >
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary/20 to-primary/20 backdrop-blur-sm text-secondary border border-secondary/20 px-6 py-3 rounded-full text-sm font-semibold mb-12 shadow-lg">
            <TrendingUp className="w-4 h-4" />
            Soluciones Financieras Profesionales
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-mono font-black text-foreground mb-8 leading-[0.9] tracking-tight">
            <span className="bg-gradient-to-r from-foreground via-secondary to-primary bg-clip-text text-transparent">
              Financiamiento Inteligente para tu Negocio
            </span>
          </h1>

          <p className="text-xl md:text-2xl lg:text-3xl text-muted-foreground/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
            Transforma tu negocio con nuestras soluciones de financiamiento
            <span className="text-secondary font-medium"> personalizadas y ágiles</span>. Obtén el capital que necesitas
            para crecer.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Button
              size="lg"
              className="bg-gradient-to-r from-secondary to-secondary/90 hover:from-secondary/90 hover:to-secondary text-white text-lg px-10 py-7 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              onClick={() => scrollToSection("contacto")}
            >
              Solicitar Asesoría
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-lg px-10 py-7 rounded-xl border-2 border-secondary/30 hover:border-secondary hover:bg-secondary/5 transition-all duration-300 bg-transparent"
              onClick={() => scrollToSection("productos")}
            >
              Ver Productos
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-4 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-600/20 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25">
              <div className="flex items-center justify-center mb-2">
                <Shield className="w-6 h-6 text-cyan-400 mb-1 drop-shadow-lg" />
              </div>
              <div className="text-3xl font-black text-black dark:text-white mb-2">500+</div>
              <div className="text-muted-foreground font-medium text-sm">Negocios Financiados</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-400/30 rounded-xl p-4 hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-600/20 transition-all duration-300 shadow-lg hover:shadow-purple-500/25">
              <div className="flex items-center justify-center mb-2">
                <Clock className="w-6 h-6 text-purple-400 mb-1 drop-shadow-lg" />
              </div>
              <div className="text-3xl font-black text-black dark:text-white mb-2">24h</div>
              <div className="text-muted-foreground font-medium text-sm">Aprobación Rápida</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-sm border border-emerald-400/30 rounded-xl p-4 hover:bg-gradient-to-br hover:from-emerald-500/20 hover:to-teal-600/20 transition-all duration-300 shadow-lg hover:shadow-emerald-500/25">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-6 h-6 text-emerald-400 mb-1 drop-shadow-lg" />
              </div>
              <div className="text-3xl font-black text-black dark:text-white mb-2">15+</div>
              <div className="text-muted-foreground font-medium text-sm">Años de Experiencia</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
