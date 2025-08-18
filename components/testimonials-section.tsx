"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "María González",
    company: "Restaurante El Buen Sabor",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    testimonial:
      "Gracias a MULTISERVICIOS pudimos expandir nuestro restaurante. El proceso fue rápido y la asesoría excepcional. Ahora tenemos dos sucursales prósperas.",
    industry: "Restauración",
  },
  {
    name: "Carlos Mendoza",
    company: "Taller Mecánico Mendoza",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    testimonial:
      "Necesitaba equipos nuevos para mi taller y ellos me ayudaron a conseguir el financiamiento perfecto. Las tasas fueron muy competitivas y el servicio excelente.",
    industry: "Automotriz",
  },
  {
    name: "Ana Rodríguez",
    company: "Boutique Fashion Style",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    testimonial:
      "La línea de crédito me permitió manejar mejor mi inventario y aprovechar las oportunidades de temporada. Recomiendo totalmente sus servicios.",
    industry: "Retail",
  },
  {
    name: "Roberto Silva",
    company: "Constructora Silva & Asociados",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    testimonial:
      "Para proyectos de construcción, el capital de trabajo es crucial. MULTISERVICIOS entendió nuestras necesidades y nos brindó la solución perfecta.",
    industry: "Construcción",
  },
  {
    name: "Laura Martínez",
    company: "Farmacia San José",
    image: "/placeholder.svg?height=80&width=80",
    rating: 5,
    testimonial:
      "El proceso digital fue increíblemente fácil. En menos de 24 horas tenía la aprobación y pude renovar todo el inventario de mi farmacia.",
    industry: "Salud",
  },
]

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1))
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying])

  const goToPrevious = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === 0 ? testimonials.length - 1 : currentIndex - 1)
  }

  const goToNext = () => {
    setIsAutoPlaying(false)
    setCurrentIndex(currentIndex === testimonials.length - 1 ? 0 : currentIndex + 1)
  }

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false)
    setCurrentIndex(index)
  }

  const currentTestimonial = testimonials[currentIndex]

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Testimonios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Lo que Dicen Nuestros Clientes</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestra mejor carta de presentación. Conoce las experiencias de
            empresarios que confiaron en nosotros.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-2 border-secondary/20 shadow-xl">
            <CardContent className="p-8 md:p-12">
              <div className="flex flex-col items-center text-center">
                {/* Quote Icon */}
                <div className="mb-6">
                  <Quote className="w-12 h-12 text-secondary/30" />
                </div>

                {/* Testimonial Text */}
                <blockquote className="text-xl md:text-2xl text-foreground mb-8 leading-relaxed font-medium">
                  "{currentTestimonial.testimonial}"
                </blockquote>

                {/* Rating */}
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(currentTestimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>

                {/* Client Info */}
                <div className="flex flex-col md:flex-row items-center gap-4">
                  <img
                    src={currentTestimonial.image || "/placeholder.svg"}
                    alt={currentTestimonial.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div className="text-center md:text-left">
                    <div className="font-semibold text-foreground text-lg">{currentTestimonial.name}</div>
                    <div className="text-muted-foreground">{currentTestimonial.company}</div>
                    <Badge variant="outline" className="mt-1">
                      {currentTestimonial.industry}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button variant="outline" size="sm" onClick={goToPrevious} className="p-2 bg-transparent">
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentIndex ? "bg-secondary" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={goToNext} className="p-2 bg-transparent">
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
