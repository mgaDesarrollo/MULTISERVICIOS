"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MessageCircle,
  Monitor,
  Zap,
  Home,
  Snowflake,
  Sofa,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Filter,
  Star,
  Eye,
  ChevronDown,
} from "lucide-react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

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
        brand: "Samsung",
        rating: 4.5,
        features: ["Convección", "Grill", "8 Funciones", "Timer Digital"],
        specifications: {
          Capacidad: "65 litros",
          Potencia: "3500W",
          Dimensiones: "60 x 60 x 55 cm",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Horno Eléctrico Empotrable por $899",
      },
      {
        title: "Microondas con Grill",
        description: "Microondas de 1.4 pies cúbicos con función grill, panel táctil y 10 niveles de potencia.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$399",
        brand: "LG",
        rating: 4.3,
        features: ["Grill", "Panel Táctil", "10 Niveles", "Descongelado Auto"],
        specifications: {
          Capacidad: "1.4 pies³",
          Potencia: "1000W",
          Dimensiones: "48 x 38 x 28 cm",
          Garantía: "1 año",
        },
        whatsappMessage: "Hola, me interesa financiar un Microondas con Grill por $399",
      },
      {
        title: "Tope de Cocina a Gas",
        description: "Tope de cocina de 4 hornillas con encendido automático y parrillas de hierro fundido.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$549",
        brand: "Whirlpool",
        rating: 4.7,
        features: ["4 Hornillas", "Encendido Auto", "Hierro Fundido", "Válvulas Seguridad"],
        specifications: {
          Hornillas: "4 quemadores",
          Material: "Acero inoxidable",
          Dimensiones: "60 x 52 x 8 cm",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Tope de Cocina a Gas por $549",
      },
      {
        title: "Campana Extractora",
        description: "Campana extractora de 60cm con 3 velocidades, filtros lavables y iluminación LED.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$299",
        brand: "Bosch",
        rating: 4.4,
        features: ["3 Velocidades", "Filtros Lavables", "LED", "Control Táctil"],
        specifications: {
          Ancho: "60 cm",
          Extracción: "650 m³/h",
          Ruido: "< 65 dB",
          Garantía: "2 años",
        },
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
        brand: "Samsung",
        rating: 4.6,
        features: ["Dispensador Agua/Hielo", "Inverter", "No Frost", "Control Digital"],
        specifications: {
          Capacidad: "25 pies³",
          Eficiencia: "A++",
          Dimensiones: "91 x 178 x 69 cm",
          Garantía: "5 años compresor",
        },
        whatsappMessage: "Hola, me interesa financiar una Heladera Side by Side por $1,899",
      },
      {
        title: "Heladera French Door",
        description: "Heladera premium de 22 pies cúbicos con cajones inferiores y control digital.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,599",
        brand: "LG",
        rating: 4.5,
        features: ["French Door", "Cajones Inferiores", "Control Digital", "Multi Air Flow"],
        specifications: {
          Capacidad: "22 pies³",
          Eficiencia: "A+",
          Dimensiones: "83 x 175 x 67 cm",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar una Heladera French Door por $1,599",
      },
      {
        title: "Heladera Compacta",
        description: "Heladera de 12 pies cúbicos ideal para espacios pequeños, eficiencia energética A+.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$699",
        brand: "Whirlpool",
        rating: 4.2,
        features: ["Compacta", "A+ Eficiencia", "Reversible", "Ajustable"],
        specifications: {
          Capacidad: "12 pies³",
          Eficiencia: "A+",
          Dimensiones: "60 x 145 x 60 cm",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar una Heladera Compacta por $699",
      },
      {
        title: "Freezer Vertical",
        description: "Congelador vertical de 8 pies cúbicos con 5 cajones y sistema No Frost.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$799",
        brand: "Bosch",
        rating: 4.4,
        features: ["5 Cajones", "No Frost", "Alarma Temperatura", "Super Congelado"],
        specifications: {
          Capacidad: "8 pies³",
          Cajones: "5 niveles",
          Dimensiones: "60 x 155 x 60 cm",
          Garantía: "3 años",
        },
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
        brand: "Samsung",
        rating: 4.5,
        features: ["18kg Capacidad", "12 Programas", "A++ Eficiencia", "Carga Frontal"],
        specifications: {
          Capacidad: "18 kg",
          Programas: "12 ciclos",
          Eficiencia: "A++",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar una Lavadora Automática 18kg por $799",
      },
      {
        title: "Secadora a Gas",
        description: "Secadora de 15kg con sensor de humedad y múltiples ciclos de secado.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$699",
        brand: "LG",
        rating: 4.3,
        features: ["15kg Capacidad", "Sensor Humedad", "Gas", "Múltiples Ciclos"],
        specifications: {
          Capacidad: "15 kg",
          Combustible: "Gas natural",
          Sensor: "Humedad automático",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar una Secadora a Gas por $699",
      },
      {
        title: "Centro de Lavado",
        description: "Combo lavadora-secadora todo en uno, ideal para espacios reducidos.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,199",
        brand: "Whirlpool",
        rating: 4.4,
        features: ["Todo en Uno", "Compacto", "Lavado y Secado", "Ahorra Espacio"],
        specifications: {
          Capacidad: "10/7 kg",
          Funciones: "Lava y seca",
          Dimensiones: "60 x 85 x 60 cm",
          Garantía: "3 años",
        },
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
        brand: "Samsung",
        rating: 4.6,
        features: ["4K UHD", "Android TV", "WiFi", "HDR"],
        specifications: {
          Pantalla: "65 pulgadas",
          Resolución: "4K UHD",
          Sistema: "Android TV",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Smart TV 65 pulgadas por $899",
      },
      {
        title: "Aire Acondicionado Split",
        description: "Sistema de climatización 18,000 BTU con tecnología inverter y control remoto.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$649",
        brand: "LG",
        rating: 4.4,
        features: ["18,000 BTU", "Inverter", "Control Remoto", "Filtro HEPA"],
        specifications: {
          Capacidad: "18,000 BTU",
          Tecnología: "Inverter",
          Área: "Hasta 35 m²",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Aire Acondicionado Split por $649",
      },
      {
        title: "Sistema de Sonido",
        description: "Equipo de sonido con Bluetooth, USB y radio FM de alta potencia.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$399",
        brand: "Sony",
        rating: 4.2,
        features: ["Bluetooth", "USB", "Radio FM", "Alta Potencia"],
        specifications: {
          Potencia: "1000W",
          Conectividad: "Bluetooth 5.0",
          Formatos: "MP3, USB, FM",
          Garantía: "1 año",
        },
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
        brand: "Ashley",
        rating: 4.5,
        features: ["3 Piezas", "Tapizado Premium", "Mesa Centro", "Garantía Estructura"],
        specifications: {
          Piezas: "Sofá 3p, 2p, mesa",
          Material: "Tela premium",
          Estructura: "Madera sólida",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar una Sala de 3 Piezas por $1,499",
      },
      {
        title: "Comedor 6 Sillas",
        description: "Mesa de comedor de madera con 6 sillas tapizadas, diseño contemporáneo.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$899",
        brand: "IKEA",
        rating: 4.3,
        features: ["6 Sillas", "Madera Sólida", "Tapizado", "Contemporáneo"],
        specifications: {
          Mesa: "150 x 90 cm",
          Material: "Madera de roble",
          Sillas: "6 tapizadas",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Comedor 6 Sillas por $899",
      },
      {
        title: "Dormitorio Matrimonial",
        description: "Juego de dormitorio completo: cama, 2 mesas de noche y cómoda con espejo.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$1,299",
        brand: "La-Z-Boy",
        rating: 4.6,
        features: ["Cama King", "2 Mesas Noche", "Cómoda", "Espejo"],
        specifications: {
          Cama: "King size",
          Piezas: "4 elementos",
          Material: "MDF enchapado",
          Garantía: "2 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Dormitorio Matrimonial por $1,299",
      },
      {
        title: "Escritorio Ejecutivo",
        description: "Escritorio de oficina con cajones, estantes y silla ergonómica incluida.",
        image: "/placeholder.svg?height=200&width=300",
        price: "$599",
        brand: "Herman Miller",
        rating: 4.4,
        features: ["Cajones", "Estantes", "Silla Incluida", "Ergonómico"],
        specifications: {
          Dimensiones: "120 x 60 x 75 cm",
          Cajones: "3 cajones",
          Silla: "Ergonómica incluida",
          Garantía: "3 años",
        },
        whatsappMessage: "Hola, me interesa financiar un Escritorio Ejecutivo por $599",
      },
    ],
  },
}

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("cocina")
  const [cart, setCart] = useState<Array<{ product: any; category: string; quantity: number }>>([])
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [priceFilter, setPriceFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [filtersOpen, setFiltersOpen] = useState(false)

  const getFilteredProducts = (products: any[]) => {
    let filtered = [...products]

    if (priceFilter !== "all") {
      filtered = filtered.filter((product) => {
        const price = Number.parseFloat(product.price.replace("$", "").replace(",", ""))
        switch (priceFilter) {
          case "under500":
            return price < 500
          case "500to1000":
            return price >= 500 && price <= 1000
          case "over1000":
            return price > 1000
          default:
            return true
        }
      })
    }

    if (brandFilter !== "all") {
      filtered = filtered.filter((product) => product.brand === brandFilter)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            Number.parseFloat(a.price.replace("$", "").replace(",", "")) -
            Number.parseFloat(b.price.replace("$", "").replace(",", ""))
          )
        case "price-high":
          return (
            Number.parseFloat(b.price.replace("$", "").replace(",", "")) -
            Number.parseFloat(a.price.replace("$", "").replace(",", ""))
          )
        case "rating":
          return b.rating - a.rating
        default:
          return a.title.localeCompare(b.title)
      }
    })

    return filtered
  }

  const getBrandsForCategory = (categoryKey: string) => {
    const brands = productCategories[categoryKey as keyof typeof productCategories]?.products.map((p) => p.brand) || []
    return [...new Set(brands)]
  }

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
          <div className="mb-8 overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full grid-cols-none gap-1 p-1">
              {Object.entries(productCategories).map(([key, category]) => {
                const IconComponent = category.icon
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-2 md:px-4 py-2 text-xs md:text-sm"
                  >
                    <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.slice(0, 4)}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <div className="mb-6">
            <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full md:w-auto flex items-center justify-between gap-2 mb-4 bg-transparent"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <span>Filtros</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-4">
                <div className="bg-card rounded-lg p-4 border">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Select value={priceFilter} onValueChange={setPriceFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Precio" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los precios</SelectItem>
                        <SelectItem value="under500">Menos de $500</SelectItem>
                        <SelectItem value="500to1000">$500 - $1,000</SelectItem>
                        <SelectItem value="over1000">Más de $1,000</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={brandFilter} onValueChange={setBrandFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Marca" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas las marcas</SelectItem>
                        {getBrandsForCategory(activeCategory).map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Nombre A-Z</SelectItem>
                        <SelectItem value="price-low">Precio: Menor a Mayor</SelectItem>
                        <SelectItem value="price-high">Precio: Mayor a Menor</SelectItem>
                        <SelectItem value="rating">Mejor Calificación</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPriceFilter("all")
                        setBrandFilter("all")
                        setSortBy("name")
                      }}
                      className="h-9"
                    >
                      Limpiar
                    </Button>
                  </div>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          {Object.entries(productCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                {getFilteredProducts(category.products).map((product, index) => (
                  <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.title}
                          className="w-full h-32 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 md:top-4 right-2 md:right-4">
                          <Badge variant="secondary" className="text-xs">
                            Financiable
                          </Badge>
                        </div>
                        <div className="absolute top-2 md:top-4 left-2 md:left-4">
                          <Badge
                            variant="default"
                            className="bg-primary text-primary-foreground font-bold text-xs md:text-sm"
                          >
                            {product.price}
                          </Badge>
                        </div>
                        <div className="absolute bottom-2 md:bottom-4 left-2 md:left-4">
                          <Badge variant="outline" className="bg-white/90 text-xs">
                            {product.brand}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-3 md:p-6 flex flex-col h-full">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                        <CardTitle className="text-sm md:text-xl mb-1 md:mb-0 line-clamp-2">{product.title}</CardTitle>
                        <span className="text-lg md:text-2xl font-bold text-primary">{product.price}</span>
                      </div>
                      <div className="flex items-center gap-1 md:gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 md:w-4 md:h-4 ${i < Math.floor(product.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs md:text-sm text-muted-foreground">({product.rating})</span>
                      </div>
                      <CardDescription className="text-muted-foreground mb-4 hidden md:block flex-grow">
                        {product.description}
                      </CardDescription>
                      <div className="space-y-1 md:space-y-2 mt-auto">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full bg-transparent text-xs md:text-sm h-8 md:h-10"
                              onClick={() => setSelectedProduct(product)}
                            >
                              <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                              <DialogTitle>{product.title}</DialogTitle>
                              <DialogDescription>Información detallada del producto</DialogDescription>
                            </DialogHeader>
                            {selectedProduct && (
                              <div className="space-y-6">
                                <img
                                  src={selectedProduct.image || "/placeholder.svg"}
                                  alt={selectedProduct.title}
                                  className="w-full h-64 object-cover rounded-lg"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="font-semibold mb-2">Información General</h4>
                                    <div className="space-y-2">
                                      <div className="flex justify-between">
                                        <span>Precio:</span>
                                        <span className="font-bold text-primary">{selectedProduct.price}</span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Marca:</span>
                                        <span>{selectedProduct.brand}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span>Calificación:</span>
                                        <div className="flex items-center gap-1">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 ${i < Math.floor(selectedProduct.rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                            />
                                          ))}
                                          <span className="ml-1">({selectedProduct.rating})</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold mb-2">Especificaciones</h4>
                                    <div className="space-y-2">
                                      {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                          <span className="text-sm">{key}:</span>
                                          <span className="text-sm font-medium">{value}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold mb-2">Características Principales</h4>
                                  <div className="flex flex-wrap gap-2">
                                    {selectedProduct.features.map((feature: string, idx: number) => (
                                      <Badge key={idx} variant="secondary">
                                        {feature}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    className="flex-1 bg-transparent"
                                    variant="outline"
                                    onClick={() => addToCart(selectedProduct, key)}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Agregar al </span>Carrito
                                  </Button>
                                  <Button
                                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm h-8 md:h-10"
                                    onClick={() => handleWhatsAppClick(selectedProduct.whatsappMessage)}
                                  >
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Obtén tu </span>Financiamiento
                                  </Button>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          className="w-full bg-transparent text-xs md:text-sm h-8 md:h-10"
                          variant="outline"
                          onClick={() => addToCart(product, key)}
                        >
                          <Plus className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Agregar al </span>Carrito
                        </Button>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs md:text-sm h-8 md:h-10"
                          onClick={() => handleWhatsAppClick(product.whatsappMessage)}
                        >
                          <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          <span className="hidden sm:inline">Obtén tu </span>Financiamiento
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
