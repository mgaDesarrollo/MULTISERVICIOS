"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Clock, MessageCircle, Send, CheckCircle } from "lucide-react"

export function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate form submission
    console.log("Form submitted:", formData)
    setIsSubmitted(true)

    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false)
      setFormData({
        name: "",
        company: "",
        email: "",
        phone: "",
        message: "",
      })
    }, 3000)
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      "Hola, me interesa conocer más sobre sus servicios de financiamiento para negocios.",
    )
    window.open(`https://wa.me/1234567890?text=${message}`, "_blank")
  }

  return (
    <section id="contacto" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Contacto
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Listo para Hacer Crecer tu Negocio?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Contáctanos hoy mismo y descubre cómo podemos ayudarte a obtener el financiamiento que necesitas para
            alcanzar tus objetivos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Contact Form */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Solicitar Asesoría</CardTitle>
              <CardDescription>
                Completa el formulario y nos pondremos en contacto contigo en menos de 24 horas.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isSubmitted ? (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Tu nombre"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa *</Label>
                      <Input
                        id="company"
                        name="company"
                        value={formData.company}
                        onChange={handleInputChange}
                        placeholder="Nombre de tu empresa"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Teléfono *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mensaje</Label>
                    <Textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Cuéntanos sobre tu proyecto y necesidades de financiamiento..."
                      rows={4}
                    />
                  </div>

                  <Button type="submit" className="w-full bg-secondary hover:bg-secondary/90">
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Consulta
                  </Button>
                </form>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">¡Mensaje Enviado!</h3>
                  <p className="text-muted-foreground">
                    Gracias por contactarnos. Nos pondremos en contacto contigo muy pronto.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Contacto Directo</CardTitle>
                <CardDescription>Prefiere hablar directamente? Contáctanos por estos medios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-secondary" />
                  <div>
                    <div className="font-medium">Teléfono</div>
                    <div className="text-muted-foreground">+1 (234) 567-8900</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-secondary" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-muted-foreground">info@multiservicios.com</div>
                  </div>
                </div>

                {/* Dirección eliminada por solicitud */}

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-secondary" />
                  <div>
                    <div className="font-medium">Horarios</div>
                    <div className="text-muted-foreground">
                      Lun - Vie: 9:00 AM - 6:00 PM
                      <br />
                      Sáb: 9:00 AM - 2:00 PM
                    </div>
                  </div>
                </div>

                <Button
                  onClick={handleWhatsAppClick}
                  className="w-full bg-green-600 hover:bg-green-700 text-white mt-6"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Chatear por WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Additional Info */}
            <Card className="shadow-lg bg-secondary/5 border-secondary/20">
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-3">¿Por qué elegirnos?</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Respuesta en menos de 24 horas
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Tasas competitivas del mercado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Proceso 100% digital y seguro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-secondary" />
                    Asesoría personalizada gratuita
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
