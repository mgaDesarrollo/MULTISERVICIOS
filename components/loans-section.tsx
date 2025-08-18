"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Building2, Zap, Shield, Clock, Calculator } from "lucide-react"

const loanTypes = [
  {
    icon: DollarSign,
    title: "Préstamos para Capital de Trabajo",
    description: "Financia tu operación diaria, inventario y gastos corrientes con tasas preferenciales.",
    benefits: ["Hasta $500,000", "Plazos flexibles", "Sin garantías hipotecarias"],
    color: "bg-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Créditos para Expansión",
    description: "Haz crecer tu negocio con financiamiento para nuevas sucursales o mercados.",
    benefits: ["Hasta $1,000,000", "Períodos de gracia", "Asesoría especializada"],
    color: "bg-green-500",
  },
  {
    icon: CreditCard,
    title: "Líneas de Crédito",
    description: "Accede a fondos cuando los necesites con nuestra línea de crédito revolvente.",
    benefits: ["Disponibilidad inmediata", "Solo pagas lo que usas", "Renovación automática"],
    color: "bg-purple-500",
  },
  {
    icon: Building2,
    title: "Financiamiento de Activos",
    description: "Adquiere maquinaria, equipos y vehículos con planes de financiamiento especializados.",
    benefits: ["Hasta 5 años de plazo", "Tasas competitivas", "El activo como garantía"],
    color: "bg-orange-500",
  },
]

const advantages = [
  {
    icon: Zap,
    title: "Aprobación Rápida",
    description: "Respuesta en menos de 24 horas",
  },
  {
    icon: Calculator,
    title: "Tasas Competitivas",
    description: "Las mejores tasas del mercado",
  },
  {
    icon: Shield,
    title: "Asesoría Personalizada",
    description: "Expertos dedicados a tu éxito",
  },
  {
    icon: Clock,
    title: "Proceso 100% Digital",
    description: "Sin papeleos innecesarios",
  },
]

export function LoansSection() {
  const scrollToContact = () => {
    const element = document.getElementById("contacto")
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="prestamos" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Préstamos para Negocios
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Soluciones de Financiamiento a tu Medida
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Ofrecemos diferentes tipos de préstamos diseñados específicamente para las necesidades de tu empresa.
          </p>
        </div>

        {/* Loan Types */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {loanTypes.map((loan, index) => {
            const IconComponent = loan.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-secondary/20"
              >
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    <div className={`p-3 rounded-lg ${loan.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{loan.title}</CardTitle>
                    </div>
                  </div>
                  <CardDescription className="text-base leading-relaxed">{loan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-6">
                    {loan.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-secondary rounded-full"></div>
                        <span className="text-sm text-muted-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    className="w-full group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors bg-transparent"
                    onClick={scrollToContact}
                  >
                    Saber Más
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Advantages */}
        <div className="bg-muted/50 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">¿Por qué Elegirnos?</h3>
            <p className="text-muted-foreground">Nos diferenciamos por nuestro compromiso con el éxito de tu negocio</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {advantages.map((advantage, index) => {
              const IconComponent = advantage.icon
              return (
                <div key={index} className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                    <IconComponent className="w-8 h-8 text-secondary" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">{advantage.title}</h4>
                  <p className="text-sm text-muted-foreground">{advantage.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
