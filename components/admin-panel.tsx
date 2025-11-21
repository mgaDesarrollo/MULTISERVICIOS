"use client"
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Save, X, Settings, ChevronLeft, ChevronRight, Star, ImagePlus, Building2, FileText, Info, CreditCard, Calculator } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { BrandLogo } from "@/components/brand-logo"

interface Product {
  id: number
  name: string
  brand?: string
  price: string | number
  installmentCount?: number
  installmentAmount?: string | number
  description?: string
  technicalInfo?: string
  image?: string
  images?: string[]
  categoryId: number
  rating?: number
  features?: string[]
  specifications?: Record<string, string>
  financingPlans?: FinancingPlan[]
}

interface FinancingPlan {
  id?: number
  installmentCount: number
  installmentAmount: number | string
}

interface Category {
  id: number
  name: string
  icon?: string
}

const initialCategories: Category[] = []
const sampleProducts: Product[] = []

interface SiteSettings {
  phone: string
  email: string
  instagram: string
  facebook: string
}

const defaultSiteSettings: SiteSettings = {
  phone: "",
  email: "",
  instagram: "",
  facebook: "",
}

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp", "image/x-webp", "image/gif"])
const SUPPORTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp", ".gif"]

const formatCurrencyAdmin = (value: number | string | undefined) => {
  const num = Number(value)
  if (!Number.isFinite(num) || num <= 0) return "—"
  return new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", minimumFractionDigits: 2 }).format(num)
}

const parseIntegerInput = (value: unknown, fallback = 0) => {
  if (typeof value === "number") return Number.isFinite(value) ? Math.trunc(value) : fallback
  const raw = String(value ?? "")
    .trim()
    .replace(/[.,\s]/g, "")
    .replace(/[^0-9-]/g, "")
  if (!raw) return fallback
  const parsed = Number.parseInt(raw, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

const parseDecimalInput = (value: unknown, fallback = 0) => {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback
  let raw = String(value ?? "").trim()
  if (!raw) return fallback
  raw = raw.replace(/\s+/g, "")
  raw = raw.replace(/[$€£¥%]/g, "")
  const hasComma = raw.includes(",")
  const hasDot = raw.includes(".")
  if (hasComma && hasDot) {
    if (raw.lastIndexOf(",") > raw.lastIndexOf(".")) {
      raw = raw.replace(/\./g, "").replace(/,/g, ".")
    } else {
      raw = raw.replace(/,/g, "")
    }
  } else if (hasComma && !hasDot) {
    raw = raw.replace(/,/g, ".")
  } else {
    raw = raw.replace(/,/g, "")
    if (hasDot) {
      const parts = raw.split(".")
      const isThousandSeparated = parts.length > 1 && parts.every((part, index) => {
        if (index === 0) return part.length <= 3
        if (index === parts.length - 1) return part.length === 3
        return part.length === 3
      })
      if (isThousandSeparated) {
        raw = raw.replace(/\./g, "")
      }
    }
  }
  raw = raw.replace(/[^0-9.-]/g, "")
  if (!raw || raw === "-" || raw === "." || raw === "-." ) return fallback
  const parsed = Number.parseFloat(raw)
  return Number.isFinite(parsed) ? parsed : fallback
}

const isSupportedImageFile = (file: File) => {
  const mime = (file.type || "").toLowerCase()
  if (mime && (mime.startsWith("image/") || SUPPORTED_IMAGE_TYPES.has(mime))) {
    if (mime === "image/x-webp") return true
    return SUPPORTED_IMAGE_TYPES.has(mime)
  }
  const name = (file.name || "").toLowerCase()
  return SUPPORTED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))
}

export function AdminPanel() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeTab, setActiveTab] = useState("products")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    brand: "",
    installmentCount: 12,
    installmentAmount: "",
    description: "",
    technicalInfo: "",
    image: "",
    categoryId: undefined,
    rating: 5,
    features: [],
    specifications: {},
    financingPlans: [],
  })
  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
  })
  const [newAllImageFiles, setNewAllImageFiles] = useState<File[]>([])
  const [editAllImageFiles, setEditAllImageFiles] = useState<File[]>([])
  const [dragIdxImages, setDragIdxImages] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [editSpecKey, setEditSpecKey] = useState("")
  const [editSpecValue, setEditSpecValue] = useState("")
  const [newFeatureValue, setNewFeatureValue] = useState("")
  const [editFeatureValue, setEditFeatureValue] = useState("")
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings)
  const [isSavingSettings, setIsSavingSettings] = useState(false)

  const handleApiResponse = useCallback(async (res: Response, opts?: { success?: string }) => {
    if (res.status === 401) {
      toast({ title: "Sesión expirada", description: "Vuelve a iniciar sesión.", variant: "destructive" as any })
      if (typeof window !== "undefined") window.location.href = "/login"
      return null
    }
    if (!res.ok) {
      try {
        const data = await res.json()
        toast({ title: "Error", description: String(data?.error || "Operación fallida"), variant: "destructive" as any })
      } catch {
        toast({ title: "Error", description: "Operación fallida", variant: "destructive" as any })
      }
      return null
    }
    if (opts?.success) toast({ title: opts.success })
    return res
  }, [toast])

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = [...arr]
    const [moved] = copy.splice(from, 1)
    copy.splice(to, 0, moved)
    return copy
  }

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST" })
      if (res.ok) {
        toast({ title: "Sesión cerrada" })
        if (typeof window !== "undefined") window.location.href = "/login"
      } else {
        toast({ title: "Error", description: "No se pudo cerrar sesión", variant: "destructive" as any })
      }
    } catch (e) {
      console.error(e)
      toast({ title: "Error", description: "Fallo inesperado", variant: "destructive" as any })
    }
  }

  const handleSaveProduct = async () => {
    if (editingProduct) {
      let uploadedEditUrls: string[] = []
      if (editAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          const files = editAllImageFiles.slice(0, 4)
          const total = files.length
          let completed = 0
          for (const f of files) {
            if (!isSupportedImageFile(f)) {
              toast({ title: "Formato no soportado", description: `${f.name} debe ser JPG, PNG, WebP o GIF.`, variant: "destructive" as any })
              continue
            }
            if (f.size > 5 * 1024 * 1024) {
              toast({ title: "Archivo muy grande", description: `${f.name} supera 5MB.`, variant: "destructive" as any })
              continue
            }
            const form = new FormData()
            form.append("file", f)
            const res = await fetch("/api/upload", { method: "POST", body: form })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            if (data?.url) uploadedEditUrls.push(data.url)
            completed += 1
            setUploadProgress(Math.round((completed / total) * 100))
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsUploading(false)
          setUploadProgress(0)
        }
      }

      const existingImages = Array.isArray(editingProduct.images) ? editingProduct.images.filter(Boolean) : []
      const combined = [...uploadedEditUrls, ...existingImages]
      let imagesFinal = Array.from(new Set(combined)).slice(0, 4)
      if (imagesFinal.length === 0) {
        const placeholder = `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(editingProduct.name)}`
        imagesFinal = [placeholder]
      }

      // Validate financing plans
      const validPlans = (editingProduct.financingPlans || []).filter(
        (p) => p.installmentCount > 0 && parseDecimalInput(String(p.installmentAmount), 0) > 0
      )
      if (validPlans.length === 0) {
        toast({ title: "Datos incompletos", description: "Define al menos un plan de financiamiento válido.", variant: "destructive" as any })
        return
      }

      const financingPlansPayload = validPlans.map((p) => ({
        installmentCount: p.installmentCount,
        installmentAmount: parseDecimalInput(String(p.installmentAmount), 0)
      }))

      // Calculate price and single installment from first plan for backward compatibility
      const firstPlan = financingPlansPayload[0]
      const priceValue = Number((firstPlan.installmentAmount * firstPlan.installmentCount).toFixed(2))

      const payload = {
        name: editingProduct.name,
        description: editingProduct.description,
        technicalInfo: editingProduct.technicalInfo,
        image: imagesFinal[0],
        images: imagesFinal.length ? imagesFinal : undefined,
        categoryId: editingProduct.categoryId,
        price: priceValue,
        installmentCount: firstPlan.installmentCount,
        installmentAmount: firstPlan.installmentAmount,
        brand: editingProduct.brand,
        rating: editingProduct.rating,
        features: editingProduct.features,
        specifications: editingProduct.specifications,
        financingPlans: financingPlansPayload,
      }
      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const response = await handleApiResponse(res, { success: "Producto actualizado" })
      if (!response) return
      const updated = await response.json()
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      setEditAllImageFiles([])
      setEditingProduct(null)
    } else if (isAddingProduct && newProduct.name && newProduct.brand && newProduct.installmentAmount) {
      let uploadedUrls: string[] = []
      if (newAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          const files = newAllImageFiles.slice(0, 4)
          const total = files.length
          let completed = 0
          for (const f of files) {
            if (!isSupportedImageFile(f)) {
              toast({ title: "Formato no soportado", description: `${f.name} debe ser JPG, PNG, WebP o GIF.`, variant: "destructive" as any })
              continue
            }
            if (f.size > 5 * 1024 * 1024) {
              toast({ title: "Archivo muy grande", description: `${f.name} supera 5MB.`, variant: "destructive" as any })
              continue
            }
            const form = new FormData()
            form.append("file", f)
            const res = await fetch("/api/upload", { method: "POST", body: form })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            if (data?.url) uploadedUrls.push(data.url)
            completed += 1
            setUploadProgress(Math.round((completed / total) * 100))
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsUploading(false)
          setUploadProgress(0)
        }
      }
      if (uploadedUrls.length === 0) {
        uploadedUrls = [`/placeholder.svg?height=200&width=300&query=${encodeURIComponent(newProduct.name || "")}`]
      }
      const imagesFinal = Array.from(new Set(uploadedUrls)).slice(0, 4)

      // Validate financing plans
      const validPlans = (newProduct.financingPlans || []).filter(
        (p) => p.installmentCount > 0 && parseDecimalInput(String(p.installmentAmount), 0) > 0
      )
      if (validPlans.length === 0) {
        toast({ title: "Datos incompletos", description: "Define al menos un plan de financiamiento válido.", variant: "destructive" as any })
        return
      }

      const financingPlansPayload = validPlans.map((p) => ({
        installmentCount: p.installmentCount,
        installmentAmount: parseDecimalInput(String(p.installmentAmount), 0)
      }))

      // Calculate price and single installment from first plan for backward compatibility
      const firstPlan = financingPlansPayload[0]
      const priceValue = Number((firstPlan.installmentAmount * firstPlan.installmentCount).toFixed(2))

      const payload = {
        name: newProduct.name,
        description: newProduct.description,
        technicalInfo: newProduct.technicalInfo,
        image: imagesFinal[0],
        images: imagesFinal.length ? imagesFinal : undefined,
        categoryId: newProduct.categoryId ?? categories[0]?.id,
        price: priceValue,
        installmentCount: firstPlan.installmentCount,
        installmentAmount: firstPlan.installmentAmount,
        brand: newProduct.brand,
        rating: newProduct.rating,
        features: newProduct.features,
        specifications: newProduct.specifications,
        financingPlans: financingPlansPayload,
      }
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const response = await handleApiResponse(res, { success: "Producto creado" })
      if (!response) return
      const created = await response.json()
      setProducts((prev) => [created, ...prev])
      setNewProduct({
        name: "",
        brand: "",
        installmentCount: 12,
        installmentAmount: "",
        description: "",
        technicalInfo: "",
        image: "",
        categoryId: undefined,
        rating: 5,
        features: [],
        specifications: {},
      })
      setNewAllImageFiles([])
      setIsAddingProduct(false)
    } else {
      toast({ title: "Datos incompletos", description: "Completa la información del producto.", variant: "destructive" as any })
    }
  }

  const handleSaveCategory = async () => {
    if (editingCategory) {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingCategory.name }),
      })
      if (res.ok) {
        const updated = await res.json()
        setCategories((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
      }
      setEditingCategory(null)
    } else if (isAddingCategory && newCategory.name) {
      const res = await fetch(`/api/categories`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCategory.name }),
      })
      if (res.ok) {
        const created = await res.json()
        setCategories((prev) => [created, ...prev])
      }
      setNewCategory({ name: "" })
      setIsAddingCategory(false)
    } else {
      toast({ title: "Datos incompletos", description: "Define el nombre de la categoría.", variant: "destructive" as any })
    }
  }

  const handleSaveSiteSettings = async () => {
    setIsSavingSettings(true)
    try {
      const res = await fetch(`/api/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteSettings),
      })
      const response = await handleApiResponse(res, { success: "Configuración actualizada" })
      if (!response) return
      const data = await response.json()
      setSiteSettings({
        phone: data?.phone ?? "",
        email: data?.email ?? "",
        instagram: data?.instagram ?? "",
        facebook: data?.facebook ?? "",
      })
    } catch (error) {
      console.error(error)
      toast({ title: "Error", description: "No se pudo guardar la configuración", variant: "destructive" as any })
    } finally {
      setIsSavingSettings(false)
    }
  }

  const handleDeleteProduct = async (id: number) => {
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" })
    if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id))
  }

  const handleDeleteCategory = async (id: number) => {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" })
    if (res.ok) {
      setCategories((prev) => prev.filter((c) => c.id !== id))
      setProducts((prev) => prev.filter((p) => p.categoryId !== id))
    }
  }

  const addFeature = (productId: string, feature: string) => {
    if (editingProduct && feature.trim()) {
      setEditingProduct({
        ...editingProduct,
        features: [...(editingProduct.features ?? []), feature.trim()],
      })
    }
  }

  const removeFeature = (productId: string, index: number) => {
    if (editingProduct) {
      setEditingProduct({
        ...editingProduct,
        features: (editingProduct.features ?? []).filter((_, i) => i !== index),
      })
    }
  }

  const addSpecification = (key: string, value: string) => {
    if (editingProduct && key.trim() && value.trim()) {
      setEditingProduct({
        ...editingProduct,
        specifications: {
          ...editingProduct.specifications,
          [key.trim()]: value.trim(),
        },
      })
    }
  }

  const removeSpecification = (key: string) => {
    if (editingProduct) {
      const newSpecs = { ...editingProduct.specifications }
      delete newSpecs[key]
      setEditingProduct({
        ...editingProduct,
        specifications: newSpecs,
      })
    }
  }

  const addNewSpecification = (key: string, value: string) => {
    if (key.trim() && value.trim()) {
      setNewProduct((prev) => ({
        ...prev,
        specifications: {
          ...(prev.specifications || {}),
          [key.trim()]: value.trim(),
        },
      }))
    }
  }

  const removeNewSpecification = (key: string) => {
    setNewProduct((prev) => {
      const next = { ...(prev.specifications || {}) } as Record<string, string>
      delete next[key]
      return { ...prev, specifications: next }
    })
  }

  useEffect(() => {
    ;(async () => {
      try {
        const [catsRes, prodRes, settingsRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/settings"),
        ])
        if (!catsRes.ok) await handleApiResponse(catsRes)
        if (!prodRes.ok) await handleApiResponse(prodRes)
        if (!settingsRes.ok) await handleApiResponse(settingsRes)
        const cats = catsRes.ok ? await catsRes.json() : []
        const prods = prodRes.ok ? await prodRes.json() : []
        const settings = settingsRes.ok ? await settingsRes.json() : defaultSiteSettings
        setCategories(cats)
        setProducts(prods)
        setSiteSettings({
          phone: settings?.phone ?? "",
          email: settings?.email ?? "",
          instagram: settings?.instagram ?? "",
          facebook: settings?.facebook ?? "",
        })
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" as any })
      }
    })()
  }, [handleApiResponse, toast])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <BrandLogo onClick={() => setActiveTab("products")} />
          <div className="flex items-center gap-2">
            <Settings className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setActiveTab("products")}>Inicio</Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
          <TabsTrigger value="categories">Gestión de Categorías</TabsTrigger>
          <TabsTrigger value="settings">Configuración del Sitio</TabsTrigger>
        </TabsList>
        <TabsContent value="products" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Productos</h2>
            <Button onClick={() => setIsAddingProduct(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Producto
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Productos</CardTitle>
              <CardDescription>Gestiona todos los productos del catálogo</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Imagen</TableHead>
                    <TableHead>Título</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Financiación</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand}</TableCell>
                      <TableCell>
                        {product.financingPlans && product.financingPlans.length > 0 ? (
                          <div className="text-sm leading-tight">
                            {product.financingPlans.slice(0, 2).map((plan, idx) => (
                              <div key={idx}>
                                <span className="font-medium">{plan.installmentCount} x</span> {formatCurrencyAdmin(plan.installmentAmount)}
                              </div>
                            ))}
                            {product.financingPlans.length > 2 && (
                              <span className="text-xs text-muted-foreground">+{product.financingPlans.length - 2} más</span>
                            )}
                          </div>
                        ) : (
                          "—"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {categories.find((c) => c.id === product.categoryId)?.name || product.categoryId}
                        </Badge>
                      </TableCell>
                      <TableCell>{product.rating}/5</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingProduct(product)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogContent showCloseButton={false} className="top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen sm:w-screen sm:h-screen max-w-none sm:max-w-none max-h-none rounded-none border-0 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="h-12 px-4 md:px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src="/placeholder-logo.svg" alt="MULTISERVICIOS" className="h-6 w-6" />
                    <span className="font-semibold truncate">MULTISERVICIOS</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground truncate">Agregar producto</span>
                  </div>
                  <DialogClose asChild>
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground" aria-label="Cerrar">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </DialogClose>
                </div>
              </div>
              <DialogTitle className="sr-only">Agregar producto</DialogTitle>
              <DialogDescription className="sr-only">
                Completa la información del nuevo producto antes de guardarlo.
              </DialogDescription>
              <div className="px-4 md:px-6 py-4 md:py-6 pb-28">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title" className="flex items-center gap-2"><FileText className="w-4 h-4" /> Título del Producto</Label>
                      <Input
                        id="title"
                        value={newProduct.name || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                        placeholder="Ej: Horno Eléctrico Empotrable"
                      />
                    </div>
                    <div>
                      <Label htmlFor="brand" className="flex items-center gap-2"><Building2 className="w-4 h-4" /> Marca</Label>
                      <Input
                        id="brand"
                        value={newProduct.brand || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                        placeholder="Ej: Samsung"
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Planes de Financiamiento</Label>
                        <p className="text-xs text-muted-foreground">Define múltiples opciones de financiamiento para este producto.</p>
                      </div>
                      {newProduct.financingPlans && newProduct.financingPlans.length > 0 && (
                        <div className="space-y-2">
                          {newProduct.financingPlans.map((plan, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                              <Input
                                type="number"
                                min="1"
                                value={plan.installmentCount}
                                onChange={(e) => {
                                  const updated = [...(newProduct.financingPlans || [])]
                                  updated[idx] = { ...updated[idx], installmentCount: Number.parseInt(e.target.value, 10) || 0 }
                                  setNewProduct({ ...newProduct, financingPlans: updated })
                                }}
                                placeholder="Cuotas"
                                className="w-24"
                              />
                              <span className="text-sm">cuotas de</span>
                              <Input
                                type="number"
                                min="0.01"
                                step="0.01"
                                value={String(plan.installmentAmount)}
                                onChange={(e) => {
                                  const updated = [...(newProduct.financingPlans || [])]
                                  updated[idx] = { ...updated[idx], installmentAmount: e.target.value }
                                  setNewProduct({ ...newProduct, financingPlans: updated })
                                }}
                                placeholder="Monto"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const updated = (newProduct.financingPlans || []).filter((_, i) => i !== idx)
                                  setNewProduct({ ...newProduct, financingPlans: updated })
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setNewProduct({
                            ...newProduct,
                            financingPlans: [
                              ...(newProduct.financingPlans || []),
                              { installmentCount: 0, installmentAmount: "" }
                            ]
                          })
                        }}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Agregar Plan
                      </Button>
                    </div>
                    <div>
                      <Label htmlFor="category">Categoría</Label>
                      <Select
                        value={newProduct.categoryId != null ? String(newProduct.categoryId) : ""}
                        onValueChange={(value) => setNewProduct({ ...newProduct, categoryId: Number(value) })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar categoría" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="images" className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Imágenes del producto (máx. 4)</Label>
                      <Input
                        id="images"
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/gif"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []) as File[]
                          setNewAllImageFiles(files.slice(0, 4))
                        }}
                      />
                      {newAllImageFiles.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">{newAllImageFiles.map((f) => f.name).join(", ")}</p>
                      )}
                      {newAllImageFiles.length > 0 && (
                        <div className="mt-2 grid grid-cols-4 gap-2">
                          {newAllImageFiles.map((f, i) => (
                            <div key={i} className="relative group border rounded overflow-hidden bg-white">
                              <img src={URL.createObjectURL(f)} alt={`prev-${i}`} className="w-full h-20 object-contain bg-white" />
                              <div className="absolute top-1 left-1">
                                {i === 0 ? (
                                  <Badge variant="secondary" className="text-[10px]">Portada</Badge>
                                ) : (
                                  <button
                                    type="button"
                                    className="text-[10px] px-1 py-0.5 rounded bg-muted hover:bg-muted/80"
                                    onClick={() => {
                                      const copy = [...newAllImageFiles]
                                      const [m] = copy.splice(i, 1)
                                      copy.unshift(m)
                                      setNewAllImageFiles(copy)
                                    }}
                                  >
                                    Portada
                                  </button>
                                )}
                              </div>
                              <button
                                type="button"
                                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-6 w-6 rounded-full opacity-90 hover:opacity-100"
                                onClick={() => setNewAllImageFiles(newAllImageFiles.filter((_, idx) => idx !== i))}
                              >
                                <X className="w-3 h-3 mx-auto" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="rating" className="flex items-center gap-2"><Star className="w-4 h-4" /> Rating (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={Number(newProduct.rating ?? 5)}
                        onChange={(e) => setNewProduct({ ...newProduct, rating: Number.parseFloat(e.target.value) })}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-2">
                  <Label htmlFor="technical-info-create" className="flex items-center gap-2"><Info className="w-4 h-4" /> Información técnica (texto libre)</Label>
                  <Textarea
                    id="technical-info-create"
                    value={newProduct.technicalInfo || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, technicalInfo: e.target.value })}
                    placeholder="Detalles técnicos generales, compatibilidades, normas, etc."
                    rows={3}
                  />
                </div>
                <div className="mt-6">
                  <Label>Especificaciones técnicas</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {["Modelo", "SKU", "Garantía", "Color", "Dimensiones", "Peso", "Condición"].map((preset) => (
                      <Button key={preset} type="button" size="sm" variant="outline" onClick={() => setNewSpecKey(preset)}>
                        {preset}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <Input
                      placeholder="Clave (ej: Potencia)"
                      value={newSpecKey}
                      onChange={(e) => setNewSpecKey(e.target.value)}
                    />
                    <Input
                      placeholder="Valor (ej: 1500W)"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        addNewSpecification(newSpecKey, newSpecValue)
                        setNewSpecKey("")
                        setNewSpecValue("")
                      }}
                    >
                      Agregar
                    </Button>
                  </div>
                  {newProduct.specifications && Object.keys(newProduct.specifications).length > 0 && (
                    <div className="mt-3 border rounded">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Clave</TableHead>
                            <TableHead>Valor</TableHead>
                            <TableHead className="w-[80px]">Acciones</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(newProduct.specifications).map(([k, v]) => (
                            <TableRow key={k}>
                              <TableCell className="font-medium">{k}</TableCell>
                              <TableCell>{String(v)}</TableCell>
                              <TableCell>
                                <Button size="sm" variant="destructive" onClick={() => removeNewSpecification(k)}>
                                  <X className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
                <div className="mt-6">
                  <Label>Características</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                    <Input
                      placeholder="Ej: Inverter, Wifi, Bajo consumo"
                      value={newFeatureValue}
                      onChange={(e) => setNewFeatureValue(e.target.value)}
                    />
                    <div className="md:col-span-2 flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const f = newFeatureValue.trim()
                          if (!f) return
                          setNewProduct((prev) => ({ ...prev, features: [...(prev.features || []), f] }))
                          setNewFeatureValue("")
                        }}
                      >
                        Agregar característica
                      </Button>
                    </div>
                  </div>
                  {Array.isArray(newProduct.features) && newProduct.features.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {newProduct.features.map((f, i) => (
                        <Badge key={`${f}-${i}`} variant="secondary" className="flex items-center gap-1">
                          {f}
                          <button
                            type="button"
                            className="ml-1 text-muted-foreground hover:text-foreground"
                            onClick={() =>
                              setNewProduct((prev) => ({
                                ...prev,
                                features: (prev.features || []).filter((_, idx) => idx !== i),
                              }))
                            }
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 md:px-6 py-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUploading ? `Subiendo... ${uploadProgress}%` : "Guardar Producto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent showCloseButton={false} className="top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen sm:w-screen sm:h-screen max-w-none sm:max-w-none max-h-none rounded-none border-0 overflow-y-auto">
              <div className="sticky top-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="h-12 px-4 md:px-6 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src="/placeholder-logo.svg" alt="MULTISERVICIOS" className="h-6 w-6" />
                    <span className="font-semibold truncate">MULTISERVICIOS</span>
                    <span className="text-muted-foreground">/</span>
                    <span className="text-sm text-muted-foreground truncate">Editar producto</span>
                  </div>
                  <DialogClose asChild>
                    <button className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-muted text-muted-foreground" aria-label="Cerrar">
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </DialogClose>
                </div>
              </div>
              <DialogTitle className="sr-only">Editar producto</DialogTitle>
              <DialogDescription className="sr-only">
                Actualiza los datos del producto seleccionado y confirma los cambios.
              </DialogDescription>
              {editingProduct && (
                <div className="px-4 md:px-6 py-4 md:py-6 pb-28 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-title">Título</Label>
                        <Input
                          id="edit-title"
                          value={editingProduct.name}
                          onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-brand">Marca</Label>
                        <Input
                          id="edit-brand"
                          value={editingProduct.brand}
                          onChange={(e) => setEditingProduct({ ...editingProduct, brand: e.target.value })}
                        />
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Planes de Financiamiento</Label>
                          <p className="text-xs text-muted-foreground">Define múltiples opciones de financiamiento para este producto.</p>
                        </div>
                        {editingProduct.financingPlans && editingProduct.financingPlans.length > 0 && (
                          <div className="space-y-2">
                            {editingProduct.financingPlans.map((plan, idx) => (
                              <div key={idx} className="flex items-center gap-2 p-2 border rounded">
                                <Input
                                  type="number"
                                  min="1"
                                  value={plan.installmentCount}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.financingPlans || [])]
                                    updated[idx] = { ...updated[idx], installmentCount: Number.parseInt(e.target.value, 10) || 0 }
                                    setEditingProduct({ ...editingProduct, financingPlans: updated })
                                  }}
                                  placeholder="Cuotas"
                                  className="w-24"
                                />
                                <span className="text-sm">cuotas de</span>
                                <Input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={String(plan.installmentAmount)}
                                  onChange={(e) => {
                                    const updated = [...(editingProduct.financingPlans || [])]
                                    updated[idx] = { ...updated[idx], installmentAmount: e.target.value }
                                    setEditingProduct({ ...editingProduct, financingPlans: updated })
                                  }}
                                  placeholder="Monto"
                                  className="flex-1"
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const updated = (editingProduct.financingPlans || []).filter((_, i) => i !== idx)
                                    setEditingProduct({ ...editingProduct, financingPlans: updated })
                                  }}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingProduct({
                              ...editingProduct,
                              financingPlans: [
                                ...(editingProduct.financingPlans || []),
                                { installmentCount: 0, installmentAmount: "" }
                              ]
                            })
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Agregar Plan
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-images" className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Subir imágenes (máx. 4)</Label>
                        <Input
                          id="edit-images"
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          multiple
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []) as File[]
                            setEditAllImageFiles(files.slice(0, 4))
                          }}
                        />
                        {editAllImageFiles.length > 0 && (
                          <div className="mt-2 grid grid-cols-4 gap-2">
                            {editAllImageFiles.map((f, i) => (
                              <div key={i} className="relative group border rounded overflow-hidden bg-white">
                                <img src={URL.createObjectURL(f)} alt={`prev-edit-${i}`} className="w-full h-20 object-contain bg-white" />
                                <div className="absolute top-1 left-1">
                                  {i === 0 ? (
                                    <Badge variant="secondary" className="text-[10px]">Portada</Badge>
                                  ) : (
                                    <button
                                      type="button"
                                      className="text-[10px] px-1 py-0.5 rounded bg-muted hover:bg-muted/80"
                                      onClick={() => {
                                        const copy = [...editAllImageFiles]
                                        const [m] = copy.splice(i, 1)
                                        copy.unshift(m)
                                        setEditAllImageFiles(copy)
                                      }}
                                    >
                                      Portada
                                    </button>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground h-6 w-6 rounded-full opacity-90 hover:opacity-100"
                                  onClick={() => setEditAllImageFiles(editAllImageFiles.filter((_, idx) => idx !== i))}
                                >
                                  <X className="w-3 h-3 mx-auto" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {editAllImageFiles.length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1">Se subirán {editAllImageFiles.length} imágenes. La primera será la portada.</p>
                        )}
                      </div>
                      {Array.isArray(editingProduct.images) && editingProduct.images.length > 0 && (
                        <div>
                          <Label>Imágenes actuales</Label>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {editingProduct.images.slice(0, 4).map((imgUrl, idx) => (
                              <div
                                key={idx}
                                className="relative flex flex-col items-center"
                                draggable
                                onDragStart={() => setDragIdxImages(idx)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={() => {
                                  if (dragIdxImages === null || dragIdxImages === idx) return
                                  const imgs = reorder(editingProduct.images || [], dragIdxImages, idx)
                                  setEditingProduct({ ...editingProduct, images: imgs, image: imgs[0] || editingProduct.image })
                                  setDragIdxImages(null)
                                }}
                              >
                                <div className="relative">
                                  <img src={imgUrl} alt={`img-${idx}`} className="w-20 h-20 object-cover rounded border" />
                                  <Button
                                    size="icon"
                                    variant="destructive"
                                    className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                                    onClick={() => {
                                      const next = (editingProduct.images || []).filter((_, i) => i !== idx)
                                      const nextCover = idx === 0 ? next[0] || editingProduct.image || "" : editingProduct.image
                                      setEditingProduct({ ...editingProduct, images: next, image: nextCover })
                                    }}
                                  >
                                    <X className="w-3 h-3" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-1 mt-1">
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    disabled={idx === 0}
                                    onClick={() => {
                                      const imgs = [...(editingProduct.images || [])]
                                      ;[imgs[idx - 1], imgs[idx]] = [imgs[idx], imgs[idx - 1]]
                                      setEditingProduct({ ...editingProduct, images: imgs, image: imgs[0] || editingProduct.image })
                                    }}
                                  >
                                    <ChevronLeft className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="outline"
                                    className="h-6 w-6"
                                    disabled={idx === Math.min(3, (editingProduct.images || []).length - 1)}
                                    onClick={() => {
                                      const imgs = [...(editingProduct.images || [])]
                                      ;[imgs[idx + 1], imgs[idx]] = [imgs[idx], imgs[idx + 1]]
                                      setEditingProduct({ ...editingProduct, images: imgs, image: imgs[0] || editingProduct.image })
                                    }}
                                  >
                                    <ChevronRight className="w-3 h-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant={idx === 0 ? "default" : "outline"}
                                    className="h-6 px-2"
                                    onClick={() => {
                                      const imgs = [...(editingProduct.images || [])]
                                      imgs.splice(idx, 1)
                                      imgs.unshift(imgUrl)
                                      setEditingProduct({ ...editingProduct, images: imgs, image: imgUrl })
                                    }}
                                  >
                                    <Star className="w-3 h-3 mr-1" /> Portada
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <Label>Características</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <Input
                        placeholder="Añadir característica"
                        value={editFeatureValue}
                        onChange={(e) => setEditFeatureValue(e.target.value)}
                      />
                      <div className="md:col-span-2 flex items-center gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const f = editFeatureValue.trim()
                            if (!f) return
                            addFeature(String(editingProduct.id), f)
                            setEditFeatureValue("")
                          }}
                        >
                          Agregar característica
                        </Button>
                      </div>
                    </div>
                    {Array.isArray(editingProduct.features) && editingProduct.features.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(editingProduct.features || []).map((f, i) => (
                          <Badge key={`${f}-${i}`} variant="secondary" className="flex items-center gap-1">
                            {f}
                            <button
                              type="button"
                              className="ml-1 text-muted-foreground hover:text-foreground"
                              onClick={() => removeFeature(String(editingProduct.id), i)}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="edit-rating">Rating</Label>
                    <Input
                      id="edit-rating"
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={editingProduct.rating}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, rating: Number.parseFloat(e.target.value) })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea
                      id="edit-description"
                      value={editingProduct.description || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-technical-info" className="flex items-center gap-2"><Info className="w-4 h-4" /> Información técnica</Label>
                    <Textarea
                      id="edit-technical-info"
                      value={editingProduct.technicalInfo || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, technicalInfo: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Especificaciones técnicas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Modelo", "SKU", "Garantía", "Color", "Dimensiones", "Peso", "Condición"].map((preset) => (
                        <Button key={preset} type="button" size="sm" variant="outline" onClick={() => setEditSpecKey(preset)}>
                          {preset}
                        </Button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <Input
                        placeholder="Clave (ej: Potencia)"
                        value={editSpecKey}
                        onChange={(e) => setEditSpecKey(e.target.value)}
                      />
                      <Input
                        placeholder="Valor (ej: 1500W)"
                        value={editSpecValue}
                        onChange={(e) => setEditSpecValue(e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          addSpecification(editSpecKey, editSpecValue)
                          setEditSpecKey("")
                          setEditSpecValue("")
                        }}
                      >
                        Agregar
                      </Button>
                    </div>
                    {editingProduct.specifications && Object.keys(editingProduct.specifications).length > 0 && (
                      <div className="mt-3 border rounded">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Clave</TableHead>
                              <TableHead>Valor</TableHead>
                              <TableHead className="w-[80px]">Acciones</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(editingProduct.specifications).map(([k, v]) => (
                              <TableRow key={k}>
                                <TableCell className="font-medium">{k}</TableCell>
                                <TableCell>{String(v)}</TableCell>
                                <TableCell>
                                  <Button size="sm" variant="destructive" onClick={() => removeSpecification(k)}>
                                    <X className="w-4 h-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                  <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 md:px-6 py-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="outline" onClick={() => setEditingProduct(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProduct} disabled={isUploading}>
                      <Save className="w-4 h-4 mr-2" />
                      {isUploading ? `Subiendo... ${uploadProgress}%` : "Guardar Cambios"}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Categorías</h2>
            <Button onClick={() => setIsAddingCategory(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Agregar Categoría
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Categorías</CardTitle>
              <CardDescription>Gestiona las categorías de productos</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-sm">{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {products.filter((p) => p.categoryId === category.id).length} productos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingCategory(category)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleDeleteCategory(category.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Dialog open={isAddingCategory} onOpenChange={setIsAddingCategory}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Categoría</DialogTitle>
                <DialogDescription>Crea una nueva categoría de productos</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category-name">Nombre de la Categoría</Label>
                  <Input
                    id="category-name"
                    value={newCategory.name || ""}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="Ej: Electrodomésticos"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button onClick={handleSaveCategory} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Guardar Categoría
                </Button>
                <Button variant="outline" onClick={() => setIsAddingCategory(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Categoría</DialogTitle>
                <DialogDescription>Modifica la información de la categoría</DialogDescription>
              </DialogHeader>
              {editingCategory && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-category-name">Nombre</Label>
                    <Input
                      id="edit-category-name"
                      value={editingCategory.name}
                      onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button onClick={handleSaveCategory} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Guardar Cambios
                    </Button>
                    <Button variant="outline" onClick={() => setEditingCategory(null)}>
                      <X className="w-4 h-4 mr-2" />
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información del sitio</CardTitle>
              <CardDescription>
                Gestiona los datos de contacto y redes que se mostrarán en la página principal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="settings-phone">Teléfono / WhatsApp</Label>
                  <Input
                    id="settings-phone"
                    value={siteSettings.phone}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ej: +54 9 11 1234 5678"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-email">Correo electrónico</Label>
                  <Input
                    id="settings-email"
                    type="email"
                    value={siteSettings.email}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Ej: contacto@multiservicios.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-instagram">Instagram</Label>
                  <Input
                    id="settings-instagram"
                    value={siteSettings.instagram}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, instagram: e.target.value }))}
                    placeholder="https://instagram.com/tuempresa"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="settings-facebook">Facebook</Label>
                  <Input
                    id="settings-facebook"
                    value={siteSettings.facebook}
                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, facebook: e.target.value }))}
                    placeholder="https://facebook.com/tuempresa"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveSiteSettings} disabled={isSavingSettings}>
                  {isSavingSettings ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
