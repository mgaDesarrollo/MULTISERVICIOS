import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Star, MessageCircle, ShoppingCart } from "lucide-react"
import Link from "next/link"
import ProductGallery from "../../../components/product-gallery"
import type { Metadata } from "next"

export const revalidate = 0

const formatCurrency = (value: number) => value.toLocaleString("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
})

const parseDecimal = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback
  const parsed = Number.parseFloat(String(value))
  return Number.isFinite(parsed) ? parsed : fallback
}

const parseInteger = (value: unknown, fallback = 0) => {
  if (value === null || value === undefined) return fallback
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : fallback
  const parsed = Number.parseInt(String(value), 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

async function getProduct(id: number) {
  const product = await prisma.product.findUnique({ where: { id } })
  if (!product) return null
  const category = await prisma.category.findUnique({ where: { id: product.categoryId } })
  return { product, category }
}

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> },
): Promise<Metadata> {
  try {
    const { id } = await params
    const numId = Number(id)
    if (!numId) return { title: "Producto - MULTISERVICIOS" }
    const prod = await prisma.product.findUnique({ where: { id: numId } })
    if (!prod) return { title: "Producto no encontrado - MULTISERVICIOS" }
    const title = `${prod.name} - MULTISERVICIOS`
    const description = prod.description || "Financiación inteligente para tus compras."
    const images = (Array.isArray((prod as any).images) && (prod as any).images.length
      ? (prod as any).images
      : [prod.image || "/placeholder.jpg"]).slice(0, 1)
    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "website",
        url: `/productos/${id}`,
        images: images.map((u: string) => ({ url: u, width: 1200, height: 630, alt: prod.name })),
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images,
      },
    }
  } catch (e) {
    return { title: "Producto - MULTISERVICIOS" }
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const numId = Number(id)
  if (!numId) notFound()

  const data = await getProduct(numId)
  if (!data) notFound()

  const { product, category } = data
  const images: string[] = (Array.isArray((product as any).images) && (product as any).images.length
    ? (product as any).images
    : [product.image || "/placeholder.svg"]).slice(0, 4)
  const priceNum = parseDecimal(product.price)
  const installmentCountRaw = parseInteger((product as any).installmentCount, 0)
  const installmentAmountRaw = parseDecimal((product as any).installmentAmount)
  const effectiveTotal = priceNum > 0 ? priceNum : installmentAmountRaw * (installmentCountRaw || 0)
  const finalInstallmentCount = installmentCountRaw > 0
    ? installmentCountRaw
    : installmentAmountRaw > 0 && effectiveTotal > 0
      ? Math.max(1, Math.round(effectiveTotal / installmentAmountRaw))
      : 0
  const finalInstallmentAmount = installmentAmountRaw > 0
    ? installmentAmountRaw
    : finalInstallmentCount > 0 && effectiveTotal > 0
      ? effectiveTotal / finalInstallmentCount
      : 0
  const installmentDisplay = finalInstallmentCount > 0 && finalInstallmentAmount > 0
    ? `${finalInstallmentCount} cuotas de ${formatCurrency(finalInstallmentAmount)}`
    : null
  const priceStr = formatCurrency(effectiveTotal)
  const originalPriceStr = formatCurrency(effectiveTotal * 1.15)
  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: numId } },
    take: 6,
    orderBy: { id: "desc" },
  })
  const createdDate = product.createdAt ? new Date(product.createdAt as any) : null

  return (
    <div className="w-full min-h-screen">
      <div className="px-4 md:px-8 py-4 md:py-8">
        <div className="mb-4 space-y-2">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-muted-foreground hover:underline">← Volver</Link>
            <Link href={`/#productos-${product.categoryId}`} className="text-sm">
              <Button variant="outline" size="sm">Volver a la categoría</Button>
            </Link>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Inicio</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="/#productos">Productos</BreadcrumbLink>
              </BreadcrumbItem>
              {category && (
                <>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <span className="text-muted-foreground">{category.name}</span>
                  </BreadcrumbItem>
                </>
              )}
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{product.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 md:gap-8">
          <div className="xl:col-span-7">
            <ProductGallery images={images} title={product.name} heightClass="h-[50vh] md:h-[60vh] xl:h-[70vh]" />
          </div>
          <div className="xl:col-span-5 space-y-4 xl:sticky xl:top-8 self-start">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center gap-2 mt-2">
                {category && <Badge variant="outline">{category.name}</Badge>}
                {product.brand && <Badge variant="secondary">{product.brand}</Badge>}
              </div>
            </div>
            <div className="text-right space-y-1">
              {installmentDisplay && (
                <div className="text-sm font-semibold text-emerald-600">{installmentDisplay}</div>
              )}
              <div className="text-3xl font-bold text-primary">{priceStr}</div>
              <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground">
                <span className="line-through">{originalPriceStr}</span>
                <Badge variant="secondary" className="text-xs">15% off</Badge>
              </div>
              <div className="flex items-center justify-end gap-1 pt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.floor(Number(product.rating ?? 4.5)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                ))}
              </div>
            </div>
          </div>

          {product.description && (
            <p className="text-muted-foreground">{product.description}</p>
          )}

          {Boolean((product as any).technicalInfo) && (
            <div>
              <h3 className="font-semibold mb-2">Información técnica</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-line">{String((product as any).technicalInfo)}</p>
            </div>
          )}

      {product.specifications && typeof product.specifications === "object" && (
            <div>
        <h3 className="font-semibold mb-2">Especificaciones técnicas</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                {Object.entries(product.specifications as any).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium">{String(v)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {Array.isArray(product.features) && product.features.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Características</h3>
              <div className="flex flex-wrap gap-2">
                {(product.features as any[]).map((f, i) => (
                  <Badge key={i} variant="secondary">{String(f)}</Badge>
                ))}
              </div>
            </div>
          )}

          <div className="border rounded-md p-3 sm:p-4">
            <h3 className="font-semibold mb-2">Ficha del producto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Marca</span><span className="font-medium">{product.brand || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Categoría</span><span className="font-medium">{category?.name || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">ID</span><span className="font-medium">{product.id}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rating</span><span className="font-medium">{Number(product.rating ?? 4.5).toFixed(1)} / 5</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Plan de cuotas</span><span className="font-medium">{installmentDisplay ?? "Consultar"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Monto por cuota</span><span className="font-medium">{finalInstallmentAmount > 0 ? formatCurrency(finalInstallmentAmount) : "Consultar"}</span></div>
              {createdDate && (
                <div className="flex justify-between"><span className="text-muted-foreground">Fecha de alta</span><span className="font-medium">{createdDate.toLocaleDateString()}</span></div>
              )}
            </div>
          </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button className="flex-1">
                <ShoppingCart className="w-4 h-4 mr-2" /> Agregar al carrito
              </Button>
              <Button className="flex-1 bg-orange-500 hover:bg-orange-600 text-white">
                <MessageCircle className="w-4 h-4 mr-2" /> Financiamiento por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <div className="px-4 md:px-8 pb-8">
          <h2 className="text-xl md:text-2xl font-semibold mb-4">Productos relacionados</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {related.map((r: any) => {
              const img = Array.isArray((r as any).images) && (r as any).images.length ? (r as any).images[0] : r.image || "/placeholder.svg"
              const rPriceNum = parseDecimal(r.price)
              const rCount = parseInteger((r as any).installmentCount, 0)
              const rAmount = parseDecimal((r as any).installmentAmount)
              const rInstallmentText = rCount > 0 && rAmount > 0
                ? `${rCount} cuotas de ${formatCurrency(rAmount)}`
                : "Financiación disponible"
              const rTotal = rPriceNum > 0 ? rPriceNum : rAmount * (rCount || 0)
              const rOriginal = formatCurrency(rTotal * 1.15)
              const rPrice = formatCurrency(rTotal)
              return (
                <Link key={r.id} href={`/productos/${r.id}`} className="block">
                  <Card className="hover:shadow-sm transition-shadow">
                    <div className="w-full h-32 bg-white flex items-center justify-center rounded-t">
                      <img src={img} alt={r.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <CardContent className="p-3">
                      <div className="text-xs text-muted-foreground line-clamp-1">{r.brand || category?.name}</div>
                      <div className="text-sm font-medium line-clamp-2">{r.name}</div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-1">{rInstallmentText}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[11px] text-muted-foreground line-through">{rOriginal}</span>
                        <Badge variant="secondary" className="text-[10px]">15% off</Badge>
                      </div>
                      <div className="text-base font-bold text-primary">{rPrice}</div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
