"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"

export function CtaBanner() {
  const handleWhatsAppClick = () => {
    const phone = "1234567890" // Replace with actual phone number
    const message = encodeURIComponent("Hola, estoy buscando un producto específico. ¿Pueden ayudarme?")
    window.open(`https://wa.me/${phone}?text=${message}`, "_blank")
  }

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
      <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-pink-500/30 rounded-full blur-3xl animate-pulse delay-75" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 md:gap-8">
          {/* Text Content */}
          <div className="text-center md:text-left flex-1">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2 sm:mb-3">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                Tenemos lo que buscas
              </h2>
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300 animate-pulse" />
            </div>
            <p className="text-base sm:text-lg md:text-xl text-purple-100 font-medium">
              Pregúntale a nuestros asesores, <span className="text-yellow-300 font-bold">nosotros lo conseguimos</span>
            </p>
          </div>

          {/* CTA Button */}
          <div className="flex-shrink-0 w-full md:w-auto">
            <Button
              onClick={handleWhatsAppClick}
              size="lg"
              className="w-full md:w-auto bg-white text-purple-600 hover:bg-purple-50 font-bold text-sm sm:text-base md:text-lg px-6 sm:px-8 py-5 sm:py-6 rounded-full shadow-2xl hover:shadow-white/50 transition-all duration-300 hover:scale-105 group"
            >
              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:animate-bounce" />
              Consultar Ahora
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
