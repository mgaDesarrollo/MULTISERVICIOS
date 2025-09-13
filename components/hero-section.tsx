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
      {/* Fondo dinámico multi capa */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-background" />
        <div className="absolute inset-0 opacity-70 dark:opacity-60" style={{
          background: `radial-gradient(circle at 30% 35%, rgba(126,58,242,0.18), transparent 55%), radial-gradient(circle at 70% 65%, rgba(37,99,235,0.20), transparent 60%)`
        }} />
        <div className="absolute inset-0 mix-blend-overlay opacity-[0.08] dark:opacity-[0.15]" style={{
          backgroundImage: `linear-gradient(90deg, rgba(255,255,255,.25) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.25) 1px, transparent 1px)` ,
          backgroundSize: '120px 120px'
        }} />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          {/* Etiqueta removida por solicitud */}

          {/* Logo principal reutilizando el del header */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="relative w-20 h-20 rounded-2xl overflow-hidden group/logo transition-all duration-500 ease-out">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-purple-500 to-orange-400 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent animate-ping opacity-75" />
                <div className="absolute inset-0 rounded-2xl border-2 border-transparent bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-border" />
                <div className="absolute inset-[4px] rounded-xl bg-black/90 flex items-center justify-center">
                  <div className="relative text-5xl font-black select-none">
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
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 animate-pulse group-hover/logo:animate-ping" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-purple-600/20 to-pink-500/20 rounded-2xl blur-xl group-hover/logo:blur-2xl transition-all duration-500 -z-10" />
            </div>
          </div>

          <h1
            className="relative select-none text-4xl md:text-6xl lg:text-7xl leading-[1.14] md:leading-[1.12] lg:leading-[1.1] mb-8 tracking-tight"
            style={{ fontFamily: 'var(--font-display)', letterSpacing: '-1.25px' }}
          >
            <span className="gradient-flow bg-gradient-to-r from-violet-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm inline-block">
              Financiamiento
            </span>{' '}
            <span className="gradient-flow-fast bg-gradient-to-r from-blue-600 via-indigo-500 to-violet-500 bg-clip-text text-transparent inline-block">
              Inteligente
            </span>
            <br />
            <span className="gradient-flow bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 bg-clip-text text-transparent inline-block">
              para tu
            </span>{' '}
            <span className="gradient-flow-fast bg-gradient-to-r from-pink-500 via-indigo-500 to-blue-500 bg-clip-text text-transparent inline-block">
              Negocio
            </span>
            <span className="absolute -inset-x-4 -inset-y-2 rounded-md pointer-events-none" aria-hidden="true" />
          </h1>

          <p className="text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-10">
            Transforma tu negocio con soluciones de financiamiento
            <span className="text-indigo-500 dark:text-indigo-400 font-medium"> personalizadas y ágiles</span>,
            obtené el capital que necesitás para crecer sin fricción.
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {[
              { icon: Shield, value: '500+', label: 'Negocios Financiados', color: 'from-cyan-400/15 to-blue-500/15 border-cyan-400/30', glow: 'shadow-cyan-500/25', iconColor: 'text-cyan-400' },
              { icon: Clock, value: '24h', label: 'Aprobación Rápida', color: 'from-violet-400/15 to-fuchsia-500/15 border-violet-400/30', glow: 'shadow-violet-500/25', iconColor: 'text-violet-400' },
              { icon: Award, value: '15+', label: 'Años de Experiencia', color: 'from-emerald-400/15 to-teal-500/15 border-emerald-400/30', glow: 'shadow-emerald-500/25', iconColor: 'text-emerald-400' },
            ].map((m, i) => (
              <div
                key={i}
                className={`relative rounded-xl border p-5 bg-gradient-to-br ${m.color} backdrop-blur-sm transition-all duration-300 shadow ${m.glow} hover:shadow-xl hover:-translate-y-1 group`}
              >
                <div className="flex items-center justify-between mb-1">
                  <m.icon className={`w-6 h-6 ${m.iconColor} drop-shadow`} />
                </div>
                <div className="text-3xl font-extrabold tracking-tight text-foreground mb-1">{m.value}</div>
                <div className="text-xs md:text-sm text-muted-foreground font-medium">{m.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
