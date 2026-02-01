"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Shield, Clock, Award, Users, TrendingUp, CheckCircle, Star, Zap } from "lucide-react"

// Estadísticas para mostrar credibilidad
const stats = [
  { value: "500+", label: "Clientes Satisfechos", icon: Users },
  { value: "15+", label: "Años de Experiencia", icon: Award },
  { value: "24hs", label: "Aprobación Rápida", icon: Clock },
  { value: "98%", label: "Satisfacción", icon: TrendingUp },
]

// Trust badges
const trustBadges = [
  { icon: Shield, text: "Proceso Seguro" },
  { icon: CheckCircle, text: "Sin Comisiones Ocultas" },
  { icon: Zap, text: "Aprobación Express" },
]

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
      className="relative min-h-[95vh] flex items-center pt-20 pb-16"
    >
      {/* Fondo dinámico multi capa con nueva paleta */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute inset-0 opacity-60 dark:opacity-50" style={{
          background: `radial-gradient(circle at 30% 35%, rgba(16,185,129,0.15), transparent 55%), radial-gradient(circle at 70% 65%, rgba(37,99,235,0.18), transparent 60%)`
        }} />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.06] dark:opacity-[0.12]" style={{
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px)` ,
          backgroundSize: '120px 120px'
        }} />
        {/* Elementos decorativos flotantes */}
        <div className="absolute top-1/4 left-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Grid layout - texto a la izquierda, visual a la derecha en desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna izquierda - Contenido principal */}
            <div className="text-center lg:text-left order-2 lg:order-1">
              {/* Badge de novedad */}
              <Badge 
                variant="secondary" 
                className="mb-6 px-4 py-1.5 text-sm font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
              >
                <Star className="w-3.5 h-3.5 mr-1.5 fill-current" />
                La mejor opción en financiamiento
              </Badge>

              {/* Título principal */}
              <h1
                className="relative select-none text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-[1.1] mb-6 tracking-tight font-bold"
              >
                <span className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 bg-clip-text text-transparent">
                  Financiamiento
                </span>
                <br />
                <span className="text-foreground">
                  Inteligente para
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-600 bg-clip-text text-transparent">
                  tu Hogar
                </span>
              </h1>

              {/* Descripción */}
              <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 leading-relaxed mb-8">
                Accede a electrodomésticos, tecnología y muebles con planes de cuotas diseñados para vos. 
                <span className="text-foreground font-medium"> Sin trámites complicados</span>, 
                <span className="text-foreground font-medium"> sin esperas</span>.
              </p>

              {/* Trust badges */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-8">
                {trustBadges.map((badge, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50 border border-border/50"
                  >
                    <badge.icon className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm text-muted-foreground">{badge.text}</span>
                  </div>
                ))}
              </div>

              {/* Botones CTA */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-10">
                <Button
                  size="lg"
                  className="relative group text-base md:text-lg px-8 py-6 rounded-xl font-semibold shadow-lg shadow-emerald-500/20 overflow-hidden"
                  onClick={() => scrollToSection("productos")}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-500 group-hover:opacity-100 opacity-90 transition" />
                  <span className="relative flex items-center">Ver Productos <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-base md:text-lg px-8 py-6 rounded-xl border-2 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all duration-300"
                  onClick={() => scrollToSection("contacto")}
                >
                  Solicitar Asesoría
                </Button>
              </div>
            </div>

            {/* Columna derecha - Logo y stats */}
            <div className="order-1 lg:order-2 flex flex-col items-center">
              {/* Logo principal mejorado */}
              <div className="relative mb-8">
                {/* Glow effect detrás del logo */}
                <div className="absolute inset-0 scale-150 bg-gradient-to-br from-emerald-500/30 via-blue-500/20 to-violet-500/30 rounded-full blur-3xl animate-pulse" />
                
                <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-3xl overflow-hidden group/logo transition-all duration-500 ease-out shadow-2xl hover:shadow-emerald-500/30">
                  {/* Main gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
                  {/* Secondary gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-emerald-400/40" />
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover/logo:translate-x-full transition-transform duration-1000" />
                  {/* Subtle border */}
                  <div className="absolute inset-0 rounded-3xl border border-emerald-300/30" />
                  
                  {/* Logo content */}
                  <div className="absolute inset-[4px] rounded-2xl bg-white/95 dark:bg-slate-900/95 flex items-center justify-center backdrop-blur-sm">
                    <div className="relative text-8xl md:text-9xl font-black select-none">
                      <span className="relative z-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                        M
                      </span>
                      {/* Subtle glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-sm rounded" />
                    </div>
                  </div>
                  
                  {/* Corner accents */}
                  <div className="absolute top-3 right-3 w-3 h-3 bg-emerald-400 rounded-full opacity-80 animate-pulse" />
                  <div className="absolute bottom-3 left-3 w-3 h-3 bg-blue-500 rounded-full opacity-80 animate-pulse delay-500" />
                </div>
              </div>

              {/* Nombre de marca */}
              <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text text-transparent mb-8">
                MULTISERVICIOS
              </h2>

              {/* Estadísticas en grid */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                {stats.map((stat, index) => (
                  <div
                    key={index}
                    className="group relative p-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300"
                  >
                    {/* Background gradient on hover */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="relative flex flex-col items-center text-center">
                      <stat.icon className="w-5 h-5 text-emerald-500 mb-2" />
                      <div className="text-2xl md:text-3xl font-bold text-foreground">
                        {stat.value}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {stat.label}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-muted-foreground animate-bounce">
            <span className="text-xs uppercase tracking-widest">Explorar</span>
            <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
              <div className="w-1 h-2 rounded-full bg-muted-foreground/50 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
