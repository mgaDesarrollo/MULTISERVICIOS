import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, DollarSign, Users, Smartphone, Award, TrendingUp, Shield } from "lucide-react"

const benefits = [
  {
    icon: Clock,
    title: "Aprobación Rápida",
    description:
      "Obtén una respuesta en menos de 24 horas. Nuestro proceso optimizado te permite acceder al financiamiento cuando más lo necesitas.",
    color: "text-blue-500",
  },
  {
    icon: DollarSign,
    title: "Tasas Competitivas",
    description:
      "Ofrecemos las mejores tasas del mercado, adaptadas a tu perfil crediticio y las necesidades específicas de tu negocio.",
    color: "text-green-500",
  },
  {
    icon: Users,
    title: "Asesoría Personalizada",
    description:
      "Un equipo de expertos te acompañará durante todo el proceso, brindándote la orientación que necesitas para tomar las mejores decisiones.",
    color: "text-purple-500",
  },
  {
    icon: Smartphone,
    title: "Proceso 100% Digital",
    description:
      "Solicita tu financiamiento desde cualquier lugar. Sin papeleos innecesarios, todo el proceso se realiza de forma digital y segura.",
    color: "text-orange-500",
  },
  {
    icon: Shield,
    title: "Seguridad Garantizada",
    description:
      "Tus datos están protegidos con los más altos estándares de seguridad. Cumplimos con todas las normativas financieras vigentes.",
    color: "text-red-500",
  },
  {
    icon: TrendingUp,
    title: "Flexibilidad de Pago",
    description:
      "Planes de pago adaptados a tu flujo de caja. Ofrecemos períodos de gracia y opciones de refinanciamiento cuando lo necesites.",
    color: "text-indigo-500",
  },
  {
    icon: Award,
    title: "Experiencia Comprobada",
    description:
      "Más de 15 años financiando el crecimiento de empresas. Conocemos las necesidades del mercado y cómo ayudarte a crecer.",
    color: "text-yellow-500",
  },
  {
    icon: CheckCircle,
    title: "Sin Comisiones Ocultas",
    description:
      "Transparencia total en nuestros costos. Lo que ves es lo que pagas, sin sorpresas ni comisiones adicionales no informadas.",
    color: "text-teal-500",
  },
]

export function BenefitsSection() {
  return (
    <section id="nosotros" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Nuestras Ventajas
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">¿Por qué Elegirnos?</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Nos diferenciamos por nuestro compromiso con el éxito de tu negocio. Descubre las ventajas que nos
            convierten en tu mejor aliado financiero.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon
            return (
              <Card
                key={index}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-secondary/20"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="mb-4 p-3 bg-secondary/10 rounded-full">
                      <IconComponent className={`w-8 h-8 ${benefit.color}`} />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-3">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
