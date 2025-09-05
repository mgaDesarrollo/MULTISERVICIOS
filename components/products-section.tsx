"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Mapa para asignar iconos por categoría cuando vengan de la base de datos
const categoryIcons: Record<string, any> = {
  cocina: Home,
  heladeras: Snowflake,
  lavanderia: Zap,
  tecnologia: Monitor,
  muebles: Sofa,
}

// Eliminado mock de productos: el catálogo se cargará 100% desde la base de datos

export function ProductsSection() {
  const [activeCategory, setActiveCategory] = useState("")
  // Catálogo dinámico desde la base de datos
  type Catalog = Record<string, { name: string; icon: any; products: any[] }>
  const [catalog, setCatalog] = useState<Catalog>({} as Catalog)
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState("")
  const [cart, setCart] = useState<Array<{ product: any; category: string; quantity: number }>>([])
  const router = useRouter()
  const [priceFilter, setPriceFilter] = useState("all")
  const [brandFilter, setBrandFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [filtersOpen, setFiltersOpen] = useState(false)

  useEffect(() => {
    // Preselect tab from hash #productos-<categoryId>
    const hash = typeof window !== "undefined" ? window.location.hash : ""
    const match = hash.match(/#productos-(\d+)/)
    if (match && match[1]) {
      setActiveCategory(match[1])
    }

    let cancelled = false

    const loadData = async () => {
      try {
        setLoading(true)
        const [cats, prods] = await Promise.all([
          fetch("/api/categories", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
          fetch("/api/products", { cache: "no-store" }).then((r) => (r.ok ? r.json() : [])),
        ])
        if (!Array.isArray(cats) || !Array.isArray(prods) || cancelled) return

        const byId: Record<string, { name: string; icon: any; products: any[] }> = {}
        for (const c of cats) {
          const slug = String(c.id ?? c.name ?? "").toLowerCase().replace(/\s+/g, "-")
          const tabKey = String(c.id ?? slug)
          byId[slug] = {
            name: c.name ?? slug,
            icon: categoryIcons[slug] ?? Monitor,
            products: [],
          }
        }
  for (const p of prods) {
      const slug = String(p.categoryId ?? "otros").toLowerCase().replace(/\s+/g, "-")
      if (!byId[slug]) byId[slug] = { name: slug, icon: Monitor, products: [] }
      byId[slug].products.push({
            id: p.id,
            title: p.name ?? "Producto",
            description: p.description ?? "",
      image: p.image ?? "/placeholder.svg",
      images: Array.isArray(p.images) ? p.images : undefined,
            price: p.price != null ? `$${String(p.price)}` : "$0",
            brand: p.brand ?? "Genérico",
            rating: Number(p.rating ?? 4.5),
            features: Array.isArray(p.features) ? p.features : [],
            specifications: typeof p.specifications === "object" && p.specifications ? p.specifications : {},
            whatsappMessage: `Hola, me interesa ${p.name ?? "este producto"}.`,
          })
        }

  // Si la categoría activa ya no existe, seleccionar la primera disponible
  const keys = Object.keys(byId)
  if (!byId[activeCategory]) setActiveCategory(keys[0] || "")
        setCatalog(byId)
        setLoadError("")
      } catch (e) {
        if (!cancelled) setLoadError("No se pudieron cargar los productos o categorías")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    // Carga inicial
    loadData()

    // Auto-refresh cada 15s
    const interval = setInterval(loadData, 15000)

    // Refresh al volver al foco
    const onFocus = () => loadData()
    window.addEventListener("focus", onFocus)

    return () => {
      cancelled = true
      clearInterval(interval)
      window.removeEventListener("focus", onFocus)
    }
  }, [activeCategory])

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
    const brands = (catalog?.[categoryKey]?.products || []).map((p: any) => p.brand) || []
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
    <section id="productos" className="py-20 bg-white">
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
                          className="w-16 h-16 object-contain rounded bg-white"
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

        {loadError && (
          <p className="text-center text-red-500 mb-4">{loadError}</p>
        )}
    <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <div className="mb-8 overflow-x-auto">
            <TabsList className="inline-flex w-max min-w-full grid-cols-none gap-1 p-1">
      {Object.entries(catalog).map(([key, categoryObj]) => {
                const category = categoryObj as { name: string; icon: any; products: any[] }
                const IconComponent = (category?.icon as any) || Monitor
                return (
                  <TabsTrigger
                    key={key}
                    value={key}
                    className="flex items-center gap-1 md:gap-2 whitespace-nowrap px-2 md:px-4 py-2 text-xs md:text-sm"
                  >
                    <IconComponent className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="hidden sm:inline">{String(category.name)}</span>
                    <span className="sm:hidden">{String(category.name).slice(0, 4)}</span>
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
                          <SelectItem key={String(brand)} value={String(brand)}>
                            {String(brand)}
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

          {Object.entries(catalog).map(([key, categoryObj]) => {
            const category = categoryObj as { name: string; icon: any; products: any[] }
            return (
            <TabsContent key={key} value={key}>
              {getFilteredProducts(category.products).length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay productos disponibles en esta categoría</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                  {getFilteredProducts(category.products).map((product, index) => (
                  <Card
                    key={index}
                    className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                    onClick={() => router.push(`/productos/${product.id ?? index}`)}
                  >
                    <CardHeader className="p-0">
                      <div className="relative overflow-hidden rounded-t-lg">
                        <div className="w-full h-32 md:h-48 bg-white flex items-center justify-center">
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="absolute top-2 md:top-4 right-2 md:right-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <span className="text-[10px] md:text-xs text-muted-foreground line-through">
                              {(() => {
                                const num = Number.parseFloat(String(product.price).replace(/[$,]/g, ""))
                                if (Number.isNaN(num)) return product.price
                                return `$${(num * 1.15).toFixed(2)}`
                              })()}
                            </span>
                            <Badge variant="secondary" className="text-[10px] md:text-xs">15% off</Badge>
                          </div>
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
                        <Button
                          variant="outline"
                          className="w-full bg-transparent text-xs md:text-sm h-8 md:h-10"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/productos/${product.id ?? index}`)
                          }}
                        >
                          <Eye className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                          Ver Detalles
                        </Button>
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
              )}
            </TabsContent>
          )})}
        </Tabs>
      </div>

  {/* Modal de detalles eliminado; ahora navegamos a /productos/[id] */}
    </section>
  )
}
