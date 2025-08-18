"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageCircle, Monitor, Zap, Home, Snowflake, Sofa, ShoppingCart, Plus, Minus, X } from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

const productCategories = {
  cocina: {
    name: "Cocina",
    icon: Home,
    products: [
      {
        title: "Horno Eléctrico Empotrable",
        description: "Horno eléctrico de 60cm con convección, grill y 8 funciones de cocción programables.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$899",
        whatsappMessage: "Hola, me interesa financiar un Horno Eléctrico Empotrable por $899",
      },
      {
        title: "Microondas con Grill",
        description: "Microondas de 1.4 pies cúbicos con función grill, panel táctil y 10 niveles de potencia.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$399",
        whatsappMessage: "Hola, me interesa financiar un Microondas con Grill por $399",
      },
      {
        title: "Tope de Cocina a Gas",
        description: "Tope de cocina de 4 hornillas con encendido automático y parrillas de hierro fundido.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$549",
        whatsappMessage: "Hola, me interesa financiar un Tope de Cocina a Gas por $549",
      },
      {
        title: "Campana Extractora",
        description: "Campana extractora de 60cm con 3 velocidades, filtros lavables y iluminación LED.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$299",
        whatsappMessage: "Hola, me interesa financiar una Campana Extractora por $299",
      },
    ],
  },
  heladeras: {
    name: "Heladeras",
    icon: Snowflake,
    products: [
      {
        title: "Heladera Side by Side",
        description: "Heladera de 25 pies cúbicos con dispensador de agua y hielo, tecnología inverter.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,899",
        whatsappMessage: "Hola, me interesa financiar una Heladera Side by Side por $1,899",
      },
      {
        title: "Heladera French Door",
        description: "Heladera premium de 22 pies cúbicos con cajones inferiores y control digital.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,599",
        whatsappMessage: "Hola, me interesa financiar una Heladera French Door por $1,599",
      },
      {
        title: "Heladera Compacta",
        description: "Heladera de 12 pies cúbicos ideal para espacios pequeños, eficiencia energética A+.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$699",
        whatsappMessage: "Hola, me interesa financiar una Heladera Compacta por $699",
      },
      {
        title: "Freezer Vertical",
        description: "Congelador vertical de 8 pies cúbicos con 5 cajones y sistema No Frost.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$799",
        whatsappMessage: "Hola, me interesa financiar un Freezer Vertical por $799",
      },
    ],
  },
  lavanderia: {
    name: "Lavandería",
    icon: Zap,
    products: [
      {
        title: "Lavadora Automática 18kg",
        description: "Lavadora de carga frontal con 12 programas de lavado y eficiencia energética A++.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$799",
        whatsappMessage: "Hola, me interesa financiar una Lavadora Automática 18kg por $799",
      },
      {
        title: "Secadora a Gas",
        description: "Secadora de 15kg con sensor de humedad y múltiples ciclos de secado.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$699",
        whatsappMessage: "Hola, me interesa financiar una Secadora a Gas por $699",
      },
      {
        title: "Centro de Lavado",
        description: "Combo lavadora-secadora todo en uno, ideal para espacios reducidos.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,199",
        whatsappMessage: "Hola, me interesa financiar un Centro de Lavado por $1,199",
      },
    ],
  },
  tecnologia: {
    name: "Tecnología",
    icon: Monitor,
    products: [
      {
        title: "Smart TV 65 pulgadas",
        description: "Televisor 4K UHD con sistema operativo Android TV y conectividad WiFi.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$899",
        whatsappMessage: "Hola, me interesa financiar un Smart TV 65 pulgadas por $899",
      },
      {
        title: "Aire Acondicionado Split",
        description: "Sistema de climatización 18,000 BTU con tecnología inverter y control remoto.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$649",
        whatsappMessage: "Hola, me interesa financiar un Aire Acondicionado Split por $649",
      },
      {
        title: "Sistema de Sonido",
        description: "Equipo de sonido con Bluetooth, USB y radio FM de alta potencia.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$399",
        whatsappMessage: "Hola, me interesa financiar un Sistema de Sonido por $399",
      },
    ],
  },
  muebles: {
    name: "Muebles",
    icon: Sofa,
    products: [
      {
        title: "Sala de 3 Piezas",
        description: "Juego de sala completo con sofá de 3 puestos, 2 puestos y mesa de centro.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,499",
        whatsappMessage: "Hola, me interesa financiar una Sala de 3 Piezas por $1,499",
      },
      {
        title: "Comedor 6 Sillas",
        description: "Mesa de comedor de madera con 6 sillas tapizadas, diseño contemporáneo.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$899",
        whatsappMessage: "Hola, me interesa financiar un Comedor 6 Sillas por $899",
      },
      {
        title: "Dormitorio Matrimonial",
        description: "Juego de dormitorio completo: cama, 2 mesas de noche y cómoda con espejo.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,299",
        whatsappMessage: "Hola, me interesa financiar un Dormitorio Matrimonial por $1,299",
      },
      {
        title: "Escritorio Ejecutivo",
        description: "Escritorio de oficina con cajones, estantes y silla ergonómica incluida.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$599",
        whatsappMessage: "Hola, me interesa financiar un Escritorio Ejecutivo por $599",
      },
    ],
  },
}

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("cocina")
  const [cart, setCart] = useState<Array<{ product: any; category: string; quantity: number }>>([])

  const addToCart = (product: any, category: string) => {
    setCart((prev) => {
      const existingItem = prev.find((item) => item.product.title === product.title)
      if (existingItem) {
        return prev.map((item) =>
          item.product.title === product.title ? { ...item, quantity: item.quantity + 1 } : item,
        )
      }
      return [...prev, { product, category, quantity: 1 }]
    })
  }

  const removeFromCart = (productTitle: string) => {
    setCart((prev) => prev.filter((item) => item.product.title !== productTitle))
  }

  const updateQuantity = (productTitle: string, newQuantity: number) => {
    if (newQuantity === 0) {
      removeFromCart(productTitle)
      return
    }
    setCart((prev) =>
      prev.map((item) => (item.product.title === productTitle ? { ...item, quantity: newQuantity } : item)),
    )
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const price = Number.parseFloat(item.product.price.replace("$", "").replace(",", ""))
      return total + price * item.quantity
    }, 0)
  }

  const getCartItemsCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const handleWhatsAppClick = (message: string) => {
    const encodedMessage = encodeURIComponent(message)
    window.open(`https://wa.me/1234567890?text=${encodedMessage}`, "_blank")
  }

  const handleCartWhatsApp = () => {
    if (cart.length === 0) return

    let message = "Hola, me interesa consultar sobre los siguientes productos:\n\n"
    cart.forEach((item, index) => {
      message += `${index + 1}. ${item.product.title} - ${item.product.price} (Cantidad: ${item.quantity})\n`
    })
    message += `\nTotal estimado: $${getTotalPrice().toLocaleString()}`
    message += "\n\n¿Podrían darme información sobre opciones de financiamiento?"

    handleWhatsAppClick(message)
  }

  return (
    <section id="productos" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4">
            Catálogo de Productos
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Financiamos los Productos que Necesitas
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Desde electrodomésticos hasta muebles para el hogar. Encuentra la solución perfecta para equipar tu hogar
            con las mejores marcas y precios.
          </p>
        </div>

        <div className="fixed bottom-6 right-6 z-50">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="lg" className="rounded-full shadow-lg relative">
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrito
                {getCartItemsCount() > 0 && (
                  <Badge className="absolute -top-2 -right-2 rounded-full min-w-[20px] h-5 flex items-center justify-center text-xs">
                    {getCartItemsCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>Carrito de Consultas</SheetTitle>
                <SheetDescription>Productos seleccionados para consultar por WhatsApp</SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                {cart.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No hay productos en el carrito</p>
                ) : (
                  <>
                    {cart.map((item, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.product.title}</h4>
                          <p className="text-sm text-muted-foreground">{item.product.price}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.title, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="w-8 text-center">{item.quantity}</span>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => updateQuantity(item.product.title, item.quantity + 1)}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.product.title)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-4">
                        <span className="font-medium">Total estimado:</span>
                        <span className="text-xl font-bold">${getTotalPrice().toLocaleString()}</span>
                      </div>
                      <Button className="w-full bg-green-600 hover:bg-green-700" onClick={handleCartWhatsApp}>
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Consultar todo por WhatsApp
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-12">
            {Object.entries(productCategories).map(([key, category]) => {
              const IconComponent = category.icon
              return (
                <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                  <IconComponent className="w-4 h-4" />
                  {category.name}
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(productCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.products.map((product, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-4 right-4">
                          <Badge variant="secondary">Financiable</Badge>
                        </div>
                        <div className="absolute top-4 left-4">
                          <Badge variant="default" className="bg-primary text-primary-foreground font-bold">
                            {product.price}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-2">
                        <CardTitle className="text-xl">{product.title}</CardTitle>
                        <span className="text-2xl font-bold text-primary">{product.price}</span>
                      </div>
                      <CardDescription className="text-muted-foreground mb-4">{product.description}</CardDescription>
                      <div className="space-y-2">
                        <Button
                          className="w-full bg-transparent"
                          variant="outline"
                          onClick={() => addToCart(product, key)}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar al Carrito
                        </Button>
                        <Button
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleWhatsAppClick(product.whatsappMessage)}
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Consultar Individual
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
