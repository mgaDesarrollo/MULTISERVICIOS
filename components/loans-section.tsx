"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DollarSign, TrendingUp, CreditCard, Building2 } from "lucide-react"

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
      </div>
    </section>
  )
}
