"use client"


import { Button } from "@/components/ui/button"
import { ArrowRight, Shield, Clock, Award } from "lucide-react"
// Gradiente del título ahora fijo (violeta a azul) independiente del tema

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
      className="relative min-h-[90vh] flex items-center pt-28 pb-16"
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
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Etiqueta removida por solicitud */}

          {/* Logo principal con nueva paleta */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="relative w-32 h-32 rounded-3xl overflow-hidden group/logo transition-all duration-300 ease-out shadow-xl">
                {/* Main gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-600" />
                {/* Secondary gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/30 via-transparent to-emerald-400/40" />
                {/* Subtle border */}
                <div className="absolute inset-0 rounded-3xl border border-emerald-300/30" />
                
                {/* Logo content */}
                <div className="absolute inset-[4px] rounded-2xl bg-white/95 dark:bg-slate-900/95 flex items-center justify-center backdrop-blur-sm">
                  <div className="relative text-8xl font-black select-none">
                    <span className="relative z-10 bg-gradient-to-br from-emerald-600 via-emerald-700 to-blue-600 bg-clip-text text-transparent drop-shadow-sm">
                      M
                    </span>
                    {/* Subtle glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-blue-500/20 blur-sm rounded" />
                  </div>
                </div>
                
                {/* Corner accents */}
                <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-400 rounded-full opacity-80" />
                <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-500 rounded-full opacity-80" />
                
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-transparent to-blue-500/30 rounded-3xl blur-xl opacity-60 group-hover/logo:opacity-100 transition-opacity duration-300 -z-10" />
              </div>
            </div>
          </div>

          <h1
            className="relative select-none text-4xl md:text-6xl lg:text-7xl leading-[1.14] md:leading-[1.12] lg:leading-[1.1] mb-8 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-1.25px' }}
          >
            <span className="gradient-flow bg-gradient-to-r from-emerald-500 via-emerald-600 to-blue-600 bg-clip-text text-transparent drop-shadow-sm inline-block">
              Multiservicios
            </span>
            <span className="absolute -inset-x-4 -inset-y-2 rounded-md pointer-events-none" aria-hidden="true" />
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-10">
            Financiamiento inteligente para tu negocio.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20">
            <Button
              size="lg"
              className="relative group text-base md:text-lg px-9 py-6 rounded-xl font-medium shadow-md shadow-indigo-500/20 overflow-hidden"
              onClick={() => scrollToSection("contacto")}
            >
              <span className="absolute inset-0 bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 group-hover:opacity-100 opacity-90 transition" />
              <span className="relative flex items-center">Solicitar Asesoría <ArrowRight className="ml-2 w-5 h-5" /></span>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-9 py-6 rounded-xl border border-indigo-400/40 hover:border-indigo-500 hover:bg-indigo-500/10 dark:hover:bg-indigo-400/10 transition-all duration-300"
              onClick={() => scrollToSection("productos")}
            >
              Ver Productos
            </Button>
          </div>


        </div>
      </div>
    </section>
  )
}
