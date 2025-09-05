"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Save, X, Settings, ChevronLeft, ChevronRight, Star, ImagePlus, DollarSign, Building2, FileText, Info } from "lucide-react"

interface Product {
  id: number
  name: string
  brand?: string
  price: string | number
  description?: string
  technicalInfo?: string
  image?: string
  images?: string[]
  categoryId: number
  rating?: number
  features?: string[]
  specifications?: Record<string, string>
}

interface Category {
  id: number
  name: string
  icon?: string
}

const initialCategories: Category[] = []
const sampleProducts: Product[] = []

export function AdminPanel() {
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeTab, setActiveTab] = useState("products")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)

  const [newImageFile, setNewImageFile] = useState<File | null>(null)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [newExtraImageFiles, setNewExtraImageFiles] = useState<File[]>([])
  // Unified images for create (first is cover)
  const [newAllImageFiles, setNewAllImageFiles] = useState<File[]>([])
  // Unified images for edit (first is cover among new selections)
  const [editAllImageFiles, setEditAllImageFiles] = useState<File[]>([])
  const [editExtraImageFiles, setEditExtraImageFiles] = useState<File[]>([])
  // DnD indices for reordering
  const [dragIdxImages, setDragIdxImages] = useState<number | null>(null)
  const [dragIdxEditExtras, setDragIdxEditExtras] = useState<number | null>(null)
  const [dragIdxNewExtras, setDragIdxNewExtras] = useState<number | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  // Temp inputs for specifications in add/edit dialogs
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [editSpecKey, setEditSpecKey] = useState("")
  const [editSpecValue, setEditSpecValue] = useState("")
  // Temp inputs for features in add/edit dialogs
  const [newFeatureValue, setNewFeatureValue] = useState("")
  const [editFeatureValue, setEditFeatureValue] = useState("")

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = [...arr]
    const [moved] = copy.splice(from, 1)
    copy.splice(to, 0, moved)
    return copy
  }

  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    name: "",
    brand: "",
    price: "",
    description: "",
  technicalInfo: "",
    image: "",
    categoryId: undefined,
    rating: 5,
    features: [],
    specifications: {},
  })

  const [newCategory, setNewCategory] = useState<Partial<Category>>({
    name: "",
    icon: "Package",
  })

  const handleSaveProduct = async () => {
    if (editingProduct) {
      // Subir nuevas imágenes seleccionadas (si hay)
      let uploadedEditUrls: string[] = []
      if (editAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          for (const f of editAllImageFiles.slice(0, 4)) {
            const form = new FormData()
            form.append("file", f)
            const res = await fetch("/api/upload", { method: "POST", body: form })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            if (data?.url) uploadedEditUrls.push(data.url)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsUploading(false)
        }
      }

      // Combinar con imágenes existentes (eliminar duplicados), dando prioridad a las nuevas
      const existingImages = Array.isArray(editingProduct.images) ? editingProduct.images.filter(Boolean) : []
      const combined = [...uploadedEditUrls, ...existingImages]
      let imagesFinal = Array.from(new Set(combined)).slice(0, 4)
      if (imagesFinal.length === 0) {
        const placeholder = `/placeholder.svg?height=200&width=300&query=${encodeURIComponent(editingProduct.name)}`
        imagesFinal = [placeholder]
      }

      const payload = {
        name: editingProduct.name,
        description: editingProduct.description,
  technicalInfo: editingProduct.technicalInfo,
        image: imagesFinal[0],
        images: imagesFinal.length ? imagesFinal : undefined,
        categoryId: editingProduct.categoryId,
        price: typeof editingProduct.price === "string" ? Number(String(editingProduct.price).replace(/[^0-9.]/g, "")) : editingProduct.price,
        brand: editingProduct.brand,
        rating: editingProduct.rating,
        features: editingProduct.features,
        specifications: editingProduct.specifications,
      }
      const res = await fetch(`/api/products/${editingProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) {
        const updated = await res.json()
        setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
      }
      setEditAllImageFiles([])
      setEditingProduct(null)
  } else if (isAddingProduct && newProduct.name && newProduct.brand && newProduct.price) {
      // Upload all selected images (first becomes cover)
      let uploadedUrls: string[] = []
      if (newAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          for (const f of newAllImageFiles.slice(0, 4)) {
            const form = new FormData()
            form.append("file", f)
            const res = await fetch("/api/upload", { method: "POST", body: form })
            if (!res.ok) throw new Error("Upload failed")
            const data = await res.json()
            if (data?.url) uploadedUrls.push(data.url)
          }
        } catch (e) {
          console.error(e)
        } finally {
          setIsUploading(false)
        }
      }
      if (uploadedUrls.length === 0) {
        uploadedUrls = [`/placeholder.svg?height=200&width=300&query=${encodeURIComponent(newProduct.name || "")}`]
      }
      const imagesFinal = Array.from(new Set(uploadedUrls)).slice(0, 4)
      const payload = {
        name: newProduct.name,
        description: newProduct.description,
  technicalInfo: newProduct.technicalInfo,
        image: imagesFinal[0],
        images: imagesFinal.length ? imagesFinal : undefined,
        categoryId: newProduct.categoryId ?? categories[0]?.id,
        price: typeof newProduct.price === "string" ? Number(String(newProduct.price).replace(/[^0-9.]/g, "")) : newProduct.price,
        brand: newProduct.brand,
        rating: newProduct.rating,
        features: newProduct.features,
        specifications: newProduct.specifications,
      }
      const res = await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      if (res.ok) {
        const created = await res.json()
        setProducts((prev) => [created, ...prev])
      }
      setNewProduct({
        name: "",
        brand: "",
        price: "",
        description: "",
  technicalInfo: "",
        image: "",
        categoryId: undefined,
        rating: 5,
        features: [],
        specifications: {},
      })
  setNewImageFile(null)
  setNewExtraImageFiles([])
  setNewAllImageFiles([])
      setIsAddingProduct(false)
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
      setNewCategory({ name: "", icon: "Package" })
      setIsAddingCategory(false)
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

  // Handlers for adding/removing specifications while creating a product
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

  // Load from API on mount
  useEffect(() => {
    ;(async () => {
      try {
        const [catsRes, prodRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
        ])
        const cats = catsRes.ok ? await catsRes.json() : []
        const prods = prodRes.ok ? await prodRes.json() : []
        setCategories(cats)
        setProducts(prods)
      } catch (e) {
        console.error(e)
      }
    })()
  }, [])

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="w-6 h-6" />
        <h1 className="text-3xl font-bold">Panel de Administración</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
          <TabsTrigger value="categories">Gestión de Categorías</TabsTrigger>
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
                    <TableHead>Precio</TableHead>
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
            <TableCell>{typeof product.price === "number" ? `$${product.price}` : String(product.price)}</TableCell>
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

          {/* Add Product Dialog */}
          <Dialog open={isAddingProduct} onOpenChange={setIsAddingProduct}>
            <DialogContent showCloseButton={false} className="top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen sm:w-screen sm:h-screen max-w-none sm:max-w-none max-h-none rounded-none border-0 overflow-y-auto">
              {/* Top brand bar */}
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
              {/* Accessible title for screen readers */}
              <DialogTitle className="sr-only">Agregar producto</DialogTitle>
              {/* Content */}
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
                  <div>
                    <Label htmlFor="price" className="flex items-center gap-2"><DollarSign className="w-4 h-4" /> Precio</Label>
                    <Input
                      id="price"
                      value={newProduct.price || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                      placeholder="Ej: $899"
                    />
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
                      accept="image/*"
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
                  {newExtraImageFiles.length > 0 && (
                    <div className="mt-1 space-y-1">
                      {newExtraImageFiles.map((f, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between text-xs"
                          draggable
                          onDragStart={() => setDragIdxNewExtras(i)}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={() => {
                            if (dragIdxNewExtras === null || dragIdxNewExtras === i) return
                            const arr = reorder(newExtraImageFiles, dragIdxNewExtras, i)
                            setNewExtraImageFiles(arr)
                            setDragIdxNewExtras(null)
                          }}
                        >
                          <span className="truncate mr-2">{f.name}</span>
                          <div className="flex items-center gap-1">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              disabled={i === 0}
                              onClick={() => {
                                const arr = [...newExtraImageFiles]
                                ;[arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]
                                setNewExtraImageFiles(arr)
                              }}
                            >
                              <ChevronLeft className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-6 w-6"
                              disabled={i === newExtraImageFiles.length - 1}
                              onClick={() => {
                                const arr = [...newExtraImageFiles]
                                ;[arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]
                                setNewExtraImageFiles(arr)
                              }}
                            >
                              <ChevronRight className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="destructive"
                              className="h-6 w-6"
                              onClick={() => setNewExtraImageFiles(newExtraImageFiles.filter((_, idx) => idx !== i))}
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={newProduct.description || ""}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="Descripción detallada del producto"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
              {/* Especificaciones técnicas - Crear */}
              {/* Información técnica - Crear */}
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
              {/* Especificaciones técnicas - Crear */}
              <div className="mt-6">
                <Label>Especificaciones técnicas</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "Modelo",
                    "SKU",
                    "Garantía",
                    "Color",
                    "Dimensiones",
                    "Peso",
                    "Condición",
                  ].map((preset) => (
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
              {/* Características - Crear */}
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
              {/* Bottom action bar */}
              <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 md:px-6 py-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setIsAddingProduct(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUploading ? "Subiendo imagen..." : "Guardar Producto"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Product Dialog */}
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent showCloseButton={false} className="top-0 left-0 translate-x-0 translate-y-0 w-screen h-screen sm:w-screen sm:h-screen max-w-none sm:max-w-none max-h-none rounded-none border-0 overflow-y-auto">
              {/* Top brand bar */}
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
              {/* Accessible title for screen readers */}
              <DialogTitle className="sr-only">Editar producto</DialogTitle>
              {/* Content */}
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
                      <div>
                        <Label htmlFor="edit-price">Precio</Label>
                        <Input
                          id="edit-price"
                          value={String(editingProduct.price)}
                          onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="edit-images" className="flex items-center gap-2"><ImagePlus className="w-4 h-4" /> Subir imágenes (máx. 4)</Label>
                        <Input
                          id="edit-images"
                          type="file"
                          accept="image/*"
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
                                  {/* Características - Editar */}
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
                        <Label htmlFor="edit-category">Categoría</Label>
                        <Select
                          value={String(editingProduct.categoryId)}
                          onValueChange={(value) => setEditingProduct({ ...editingProduct, categoryId: Number(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue />
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
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Descripción</Label>
                    <Textarea
                      id="edit-description"
                      value={editingProduct.description}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  {/* Información técnica - Editar */}
                  <div>
                    <Label htmlFor="edit-technical-info">Información técnica (texto libre)</Label>
                    <Textarea
                      id="edit-technical-info"
                      value={editingProduct.technicalInfo || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, technicalInfo: e.target.value })}
                      rows={3}
                    />
                  </div>
                  {/* Especificaciones técnicas - Editar */}
                  <div>
                    <Label>Especificaciones técnicas</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {[
                        "Modelo",
                        "SKU",
                        "Garantía",
                        "Color",
                        "Dimensiones",
                        "Peso",
                        "Condición",
                      ].map((preset) => (
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
                </div>
              )}
              {/* Bottom action bar */}
              <div className="sticky bottom-0 left-0 right-0 z-10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t px-4 md:px-6 py-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button variant="outline" onClick={() => setEditingProduct(null)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancelar
                </Button>
                <Button onClick={handleSaveProduct} disabled={isUploading}>
                  <Save className="w-4 h-4 mr-2" />
                  {isUploading ? "Subiendo imagen..." : "Guardar Cambios"}
                </Button>
              </div>
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
                    <TableHead>Ícono</TableHead>
                    <TableHead>Productos</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-mono text-sm">{category.id}</TableCell>
                      <TableCell className="font-medium">{category.name}</TableCell>
                      <TableCell>{category.icon}</TableCell>
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

          {/* Add Category Dialog */}
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
                <div>
                  <Label htmlFor="category-icon">Ícono (Lucide Icon Name)</Label>
                  <Input
                    id="category-icon"
                    value={newCategory.icon || ""}
                    onChange={(e) => setNewCategory({ ...newCategory, icon: e.target.value })}
                    placeholder="Ej: Package, Home, Zap"
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

          {/* Edit Category Dialog */}
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
                  <div>
                    <Label htmlFor="edit-category-icon">Ícono</Label>
                    <Input
                      id="edit-category-icon"
                      value={editingCategory.icon}
                      onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
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
      </Tabs>
    </div>
  )
}
