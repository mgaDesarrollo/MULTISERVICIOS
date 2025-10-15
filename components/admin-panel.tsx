"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, Save, X, Settings, ChevronLeft, ChevronRight, Star, ImagePlus, DollarSign, Building2, FileText, Info, MoreVertical, Phone as PhoneIcon, Mail, Download, Eye, CalendarClock } from "lucide-react"
import { differenceInCalendarDays, format as formatDate } from "date-fns"
import { useToast } from "@/components/ui/use-toast"
import { BrandLogo } from "@/components/brand-logo"

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

interface Client {
  id: number
  name: string
  dni?: string
  cuit?: string
  email?: string
  phone?: string
  notes?: string
  createdAt?: string
  moraTotal?: number
}

interface ClientWithHistory extends Client {
  sales?: Array<{
    id: number
    subtotal: string | number
    interest: string | number
    total: string | number
    status: string
    createdAt: string
    financingMethod?: { name: string }
    installments?: Array<{
      id: number
      number: number
      dueDate: string
      totalDue: string | number
      amountPaid: string | number
      status: string
    }>
    payments?: Array<{
      id: number
      amount: string | number
      method: string
      date: string
      appliedPrincipal?: string | number
      appliedInterest?: string | number
      appliedFees?: string | number
    }>
  }>
}

interface FinancingMethod {
  id: number
  name: string
  description?: string
  interestRate: number
  installments: number
  createdAt?: string
}

interface SaleItemInput { productId: number; quantity: number; unitPrice: number }
interface Sale {
  id: number
  clientId: number
  financingMethodId: number
  subtotal: number | string
  interest: number | string
  total: number | string
  createdAt?: string
  items: Array<{ id: number; productId: number; quantity: number; unitPrice: number | string; product?: Product }>
  client?: Client
  financingMethod?: FinancingMethod
}

interface RealPayment {
  id: number
  saleId: number
  installmentId?: number | null
  amount: string | number
  method: string
  date: string
  reference?: string | null
  notes?: string | null
  appliedPrincipal?: string | number
  appliedInterest?: string | number
  appliedFees?: string | number
  sale?: {
    id: number
    client?: { id: number; name: string }
    clientId: number
  }
  installment?: {
    id: number
    number: number
    dueDate: string
  } | null
}

const initialCategories: Category[] = []
const sampleProducts: Product[] = []

export function AdminPanel() {
  const { toast } = useToast()
  const [products, setProducts] = useState<Product[]>(sampleProducts)
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isAddingProduct, setIsAddingProduct] = useState(false)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  // Clients & Payments
  const [clients, setClients] = useState<Client[]>([])
  const [realPayments, setRealPayments] = useState<RealPayment[]>([])
  const [editingClient, setEditingClient] = useState<Client | null>(null)
  const [isAddingClient, setIsAddingClient] = useState(false)
  const [clientHistory, setClientHistory] = useState<ClientWithHistory | null>(null)
  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  // Financing & Sales
  const [financingMethods, setFinancingMethods] = useState<FinancingMethod[]>([])
  const [editingMethod, setEditingMethod] = useState<FinancingMethod | null>(null)
  const [isAddingMethod, setIsAddingMethod] = useState(false)
  const [sales, setSales] = useState<Sale[]>([])
  const [isAddingSale, setIsAddingSale] = useState(false)
  const [saleDraft, setSaleDraft] = useState<{ clientId?: number; financingMethodId?: number; items: SaleItemInput[] }>({ items: [] })
  // Schedule viewer state
  const [isScheduleOpen, setIsScheduleOpen] = useState(false)
  const [scheduleSale, setScheduleSale] = useState<any | null>(null)
  const [isPayOpen, setIsPayOpen] = useState(false)
  const [payAmount, setPayAmount] = useState<string>("")
  const [payMethod, setPayMethod] = useState<string>("CASH")
  const [payInstallmentId, setPayInstallmentId] = useState<number | undefined>(undefined)

  // Sales Filters
  const [salesSearchTerm, setSalesSearchTerm] = useState("")
  const [salesFilterClient, setSalesFilterClient] = useState<string>("all")
  const [salesFilterMethod, setSalesFilterMethod] = useState<string>("all")
  const [salesFilterStatus, setSalesFilterStatus] = useState<string>("all")
  const [salesFilterMinAmount, setSalesFilterMinAmount] = useState("")
  const [salesFilterMaxAmount, setSalesFilterMaxAmount] = useState("")
  const [salesFilterDateFrom, setSalesFilterDateFrom] = useState("")
  const [salesFilterDateTo, setSalesFilterDateTo] = useState("")
  
  // Cobranzas Filters
  const [cobranzasSearchClient, setCobranzasSearchClient] = useState("")
  
  // Payments Filters
  const [paymentsSearchClient, setPaymentsSearchClient] = useState("")
  const [paymentsFilterMethod, setPaymentsFilterMethod] = useState<string>("all")
  const [paymentsFilterDateFrom, setPaymentsFilterDateFrom] = useState("")
  const [paymentsFilterDateTo, setPaymentsFilterDateTo] = useState("")
  
  // New Sale Modal - Client Search
  const [clientSearchTerm, setClientSearchTerm] = useState("")

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
  const [uploadProgress, setUploadProgress] = useState<number>(0)
  // Temp inputs for specifications in add/edit dialogs
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [editSpecKey, setEditSpecKey] = useState("")
  const [editSpecValue, setEditSpecValue] = useState("")
  // Temp inputs for features in add/edit dialogs
  const [newFeatureValue, setNewFeatureValue] = useState("")
  const [editFeatureValue, setEditFeatureValue] = useState("")
  // Dashboard datasets
  const [dashSales, setDashSales] = useState<any[]>([])
  const [dashPayments, setDashPayments] = useState<any[]>([])
  const [instToday, setInstToday] = useState<any[]>([])
  const [instOverdue, setInstOverdue] = useState<any[]>([])
  const [allInstallments, setAllInstallments] = useState<any[]>([])

  // Helpers: clipboard & exports for clients
  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "Copiado", description: `${label} copiado al portapapeles.` })
    } catch {
      // Fallback for older browsers
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      toast({ title: "Copiado", description: `${label} copiado al portapapeles.` })
    }
  }

  const exportClientJson = (c: Client) => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: "application/json;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cliente-${c.id}.json`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exportado", description: "Cliente exportado a JSON." })
  }

  const exportClientCsv = (c: Client) => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`
    const headers = ["id", "name", "dni", "cuit", "email", "phone", "notes", "createdAt"].join(",")
    const row = [c.id, c.name, c.dni || "", c.cuit || "", c.email || "", c.phone || "", (c.notes || "").replace(/\n/g, " "), c.createdAt || ""]
      .map(esc)
      .join(",")
    const csv = `${headers}\n${row}`
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `cliente-${c.id}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast({ title: "Exportado", description: "Cliente exportado a CSV." })
  }

  // Generic API response handler: redirects on 401 and shows error toasts
  const handleApiResponse = async (res: Response, opts?: { success?: string }) => {
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
  }

  const reorder = <T,>(arr: T[], from: number, to: number): T[] => {
    const copy = [...arr]
    const [moved] = copy.splice(from, 1)
    copy.splice(to, 0, moved)
    return copy
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout', { method: 'POST' })
      if (res.ok) {
        toast({ title: 'Sesión cerrada' })
        if (typeof window !== 'undefined') window.location.href = '/login'
      } else {
        toast({ title: 'Error', description: 'No se pudo cerrar sesión', variant: 'destructive' as any })
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Fallo inesperado', variant: 'destructive' as any })
    }
  }

  // Helpers
  const num = (v: any) => Number((v as any)?.toString?.() ?? v) || 0
  const currency = (n: number) => `$${n.toFixed(2)}`
  const isSameDay = (d: Date, e: Date) => d.getFullYear() === e.getFullYear() && d.getMonth() === e.getMonth() && d.getDate() === e.getDate()
  const parseAmount = (val: string | number) => {
    if (typeof val === 'number') return val
    let s = (val ?? '').toString().trim().replace(/\s/g, '')
    const hasComma = s.includes(',')
    const hasDot = s.includes('.')
    if (hasComma && hasDot) {
      // Asumimos formato es: miles con punto y decimales con coma (e.g., 1.234,56)
      s = s.replace(/\./g, '').replace(',', '.')
    } else if (hasComma && !hasDot) {
      // Solo coma -> usar como decimal
      s = s.replace(',', '.')
    } // si solo punto o ninguno, dejamos como está
    const n = Number(s)
    return Number.isFinite(n) ? n : NaN
  }

  // Fetch Dashboard/Cobranzas/Payments
  useEffect(() => {
    const run = async () => {
      if (activeTab === 'dashboard' || activeTab === 'cobranzas') {
        try {
          const [sRes, pRes, tRes, oRes, allRes] = await Promise.all([
            fetch('/api/sales'),
            fetch('/api/payments'),
            fetch(`/api/installments?dueOn=${new Date().toISOString()}`),
            fetch('/api/installments?overdueOnly=1'),
            fetch('/api/installments'), // All installments for "next 7 days"
          ])
          const sOk = await handleApiResponse(sRes)
          const pOk = await handleApiResponse(pRes)
          const tOk = await handleApiResponse(tRes)
          const oOk = await handleApiResponse(oRes)
          const allOk = await handleApiResponse(allRes)
          if (sOk) setDashSales(await sRes!.json())
          if (pOk) setDashPayments(await pRes!.json())
          if (tOk) setInstToday(await tRes!.json())
          if (oOk) setInstOverdue(await oRes!.json())
          if (allOk) setAllInstallments(await allRes!.json())
        } catch (e) {
          console.error(e)
        }
      }
      if (activeTab === 'payments') {
        try {
          const res = await fetch('/api/payments')
          const ok = await handleApiResponse(res)
          if (ok) setRealPayments(await res!.json())
        } catch (e) {
          console.error(e)
        }
      }
    }
    run()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab])

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
      // Upload newly selected images for edit (first becomes cover among new ones)
      let uploadedEditUrls: string[] = []
      if (editAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          const files = editAllImageFiles.slice(0, 4)
          const total = files.length
          let completed = 0
          for (const f of files) {
            if (!f.type.startsWith("image/")) {
              toast({ title: "Archivo inválido", description: `${f.name} no es una imagen.`, variant: "destructive" as any })
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
  toast({ title: "Producto actualizado", description: "Imágenes actualizadas correctamente." })
  } else if (isAddingProduct && newProduct.name && newProduct.brand && newProduct.price) {
      // Upload all selected images (first becomes cover)
      let uploadedUrls: string[] = []
      if (newAllImageFiles.length > 0) {
        try {
          setIsUploading(true)
          const files = newAllImageFiles.slice(0, 4)
          const total = files.length
          let completed = 0
          for (const f of files) {
            if (!f.type.startsWith("image/")) {
              toast({ title: "Archivo inválido", description: `${f.name} no es una imagen.`, variant: "destructive" as any })
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
  toast({ title: "Producto creado", description: "Se guardó el producto con sus imágenes." })
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
        const [catsRes, prodRes, clientsRes, methodsRes, salesRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/products"),
          fetch("/api/clients"),
          fetch("/api/financing"),
          fetch("/api/sales"),
        ])
        if (!catsRes.ok) await handleApiResponse(catsRes)
        if (!prodRes.ok) await handleApiResponse(prodRes)
        if (!clientsRes.ok) await handleApiResponse(clientsRes)
        if (!methodsRes.ok) await handleApiResponse(methodsRes)
        if (!salesRes.ok) await handleApiResponse(salesRes)
        const cats = catsRes.ok ? await catsRes.json() : []
        const prods = prodRes.ok ? await prodRes.json() : []
        const cls = clientsRes.ok ? await clientsRes.json() : []
        const fms = methodsRes.ok ? await methodsRes.json() : []
        const sv = salesRes.ok ? await salesRes.json() : []
        setCategories(cats)
        setProducts(prods)
        setClients(cls)
        setFinancingMethods(fms)
        setSales(sv)
      } catch (e) {
        console.error(e)
        toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" as any })
      }
    })()
  }, [])

  // Debug: Monitor isPayOpen state
  useEffect(() => {
    console.log('🟢 isPayOpen state changed to:', isPayOpen)
  }, [isPayOpen])

  // Filter sales based on all filter criteria
  const filteredSales = sales.filter((sale) => {
    // Search term (ID or client name)
    if (salesSearchTerm) {
      const term = salesSearchTerm.toLowerCase()
      const matchesId = String(sale.id).includes(term)
      const matchesClient = sale.client?.name?.toLowerCase().includes(term) || false
      if (!matchesId && !matchesClient) return false
    }

    // Client filter
    if (salesFilterClient !== "all" && String(sale.clientId) !== salesFilterClient) {
      return false
    }

    // Financing method filter
    if (salesFilterMethod !== "all" && String(sale.financingMethodId) !== salesFilterMethod) {
      return false
    }

    // Amount range filter
    const total = typeof sale.total === 'number' ? sale.total : parseFloat(String(sale.total))
    if (salesFilterMinAmount && total < parseFloat(salesFilterMinAmount)) {
      return false
    }
    if (salesFilterMaxAmount && total > parseFloat(salesFilterMaxAmount)) {
      return false
    }

    // Date range filter
    if (sale.createdAt) {
      const saleDate = new Date(sale.createdAt)
      if (salesFilterDateFrom) {
        const fromDate = new Date(salesFilterDateFrom)
        if (saleDate < fromDate) return false
      }
      if (salesFilterDateTo) {
        const toDate = new Date(salesFilterDateTo)
        toDate.setHours(23, 59, 59, 999) // Include full day
        if (saleDate > toDate) return false
      }
    }

    // Status filter (requires checking installments - will be "all" for now since we don't have installments loaded)
    // This would require fetching installment data or including it in the sales list
    // For now, we'll skip complex status filtering unless installments are included

    return true
  })

  // Clear all sales filters
  const clearSalesFilters = () => {
    setSalesSearchTerm("")
    setSalesFilterClient("all")
    setSalesFilterMethod("all")
    setSalesFilterStatus("all")
    setSalesFilterMinAmount("")
    setSalesFilterMaxAmount("")
    setSalesFilterDateFrom("")
    setSalesFilterDateTo("")
  }

  // Filter clients for new sale modal (by name or DNI)
  const filteredClientsForSale = clients.filter((client) => {
    if (!clientSearchTerm) return true
    const term = clientSearchTerm.toLowerCase()
    const matchesName = client.name?.toLowerCase().includes(term) || false
    const matchesDni = client.dni?.toLowerCase().includes(term) || false
    return matchesName || matchesDni
  })

  // ========== COBRANZAS FILTERS & STATS ==========
  
  // Filter installments for Cobranzas
  const filteredInstToday = instToday.filter((i: any) => {
    if (cobranzasSearchClient) {
      const term = cobranzasSearchClient.toLowerCase()
      const clientName = i.sale?.client?.name?.toLowerCase() || ""
      if (!clientName.includes(term)) return false
    }
    return true
  })

  const filteredInstOverdue = instOverdue.filter((i: any) => {
    if (cobranzasSearchClient) {
      const term = cobranzasSearchClient.toLowerCase()
      const clientName = i.sale?.client?.name?.toLowerCase() || ""
      if (!clientName.includes(term)) return false
    }
    return true
  })

  // Calculate "Próximos 7 días" (installments due in next 7 days, excluding today and overdue)
  const instNext7Days = allInstallments.filter((i: any) => {
    if (i.status === "PAID") return false
    
    const due = new Date(i.dueDate)
    due.setHours(0, 0, 0, 0)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Must be in the future (not today, not overdue)
    const daysUntilDue = differenceInCalendarDays(due, today)
    if (daysUntilDue < 1 || daysUntilDue > 7) return false
    
    // Filter by client search
    if (cobranzasSearchClient) {
      const term = cobranzasSearchClient.toLowerCase()
      const clientName = i.sale?.client?.name?.toLowerCase() || ""
      if (!clientName.includes(term)) return false
    }
    
    return true
  })

  // Sort by due date (closest first)
  const sortedInstNext7Days = [...instNext7Days].sort((a: any, b: any) => {
    const dueA = new Date(a.dueDate).getTime()
    const dueB = new Date(b.dueDate).getTime()
    return dueA - dueB
  })

  // Calculate stats for Cobranzas
  const cobranzasStats = {
    todayCount: filteredInstToday.length,
    todayAmount: filteredInstToday.reduce((sum: number, i: any) => {
      const total = num(i.totalDue)
      const paid = num(i.amountPaid)
      return sum + Math.max(0, total - paid)
    }, 0),
    overdueCount: filteredInstOverdue.length,
    overdueAmount: filteredInstOverdue.reduce((sum: number, i: any) => {
      const total = num(i.totalDue)
      const paid = num(i.amountPaid)
      const remaining = Math.max(0, total - paid)
      const due = new Date(i.dueDate)
      const overdueDays = Math.max(0, differenceInCalendarDays(new Date(), due))
      const interestPaidBefore = Math.min(paid, num(i.interestDue))
      const principalPaidBefore = Math.max(0, Math.min(num(i.principalDue), paid - interestPaidBefore))
      const remainingPI = Math.max(0, (num(i.interestDue) - interestPaidBefore) + (num(i.principalDue) - principalPaidBefore))
      const fee = Number((remainingPI * 0.001 * overdueDays).toFixed(2))
      return sum + remaining + fee
    }, 0),
    next7Count: sortedInstNext7Days.length,
    next7Amount: sortedInstNext7Days.reduce((sum: number, i: any) => {
      const total = num(i.totalDue)
      const paid = num(i.amountPaid)
      return sum + Math.max(0, total - paid)
    }, 0)
  }

  // ========== PAYMENTS FILTERS ==========
  
  const filteredPayments = realPayments.filter((payment: any) => {
    // Client search
    if (paymentsSearchClient) {
      const term = paymentsSearchClient.toLowerCase()
      const clientName = payment.installment?.sale?.client?.name?.toLowerCase() || ""
      if (!clientName.includes(term)) return false
    }
    
    // Method filter
    if (paymentsFilterMethod !== "all") {
      if (payment.method !== paymentsFilterMethod) return false
    }
    
    // Date from filter
    if (paymentsFilterDateFrom) {
      const paymentDate = new Date(payment.createdAt)
      const fromDate = new Date(paymentsFilterDateFrom)
      fromDate.setHours(0, 0, 0, 0)
      if (paymentDate < fromDate) return false
    }
    
    // Date to filter
    if (paymentsFilterDateTo) {
      const paymentDate = new Date(payment.createdAt)
      const toDate = new Date(paymentsFilterDateTo)
      toDate.setHours(23, 59, 59, 999)
      if (paymentDate > toDate) return false
    }
    
    return true
  })

  const clearPaymentsFilters = () => {
    setPaymentsSearchClient("")
    setPaymentsFilterMethod("all")
    setPaymentsFilterDateFrom("")
    setPaymentsFilterDateTo("")
  }

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
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="cobranzas">Cobranzas</TabsTrigger>
          <TabsTrigger value="products">Gestión de Productos</TabsTrigger>
          <TabsTrigger value="categories">Gestión de Categorías</TabsTrigger>
          <TabsTrigger value="clients">Gestión de Clientes</TabsTrigger>
          <TabsTrigger value="payments">Gestión de Pagos</TabsTrigger>
          <TabsTrigger value="financing">Métodos de Financiamiento</TabsTrigger>
          <TabsTrigger value="sales">Gestión de Ventas</TabsTrigger>
        </TabsList>

        {/* Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>KPIs clave</CardTitle>
              <CardDescription>Ventas y cobranzas recientes</CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const now = new Date()
                const startMonth = new Date(now.getFullYear(), now.getMonth(), 1)
                const salesToday = dashSales.filter((s) => s.createdAt && isSameDay(new Date(s.createdAt), now))
                const salesMonth = dashSales.filter((s) => s.createdAt && new Date(s.createdAt) >= startMonth)
                const totalSalesToday = salesToday.reduce((a, s) => a + num(s.total), 0)
                const totalSalesMonth = salesMonth.reduce((a, s) => a + num(s.total), 0)
                const ticketAvg = salesMonth.length ? totalSalesMonth / salesMonth.length : 0
                const paysToday = dashPayments.filter((p) => p.date && isSameDay(new Date(p.date), now))
                const paysMonth = dashPayments.filter((p) => p.date && new Date(p.date) >= startMonth)
                const cobranzasHoy = paysToday.reduce((a, p) => a + num(p.amount), 0)
                const cobranzasMes = paysMonth.reduce((a, p) => a + num(p.amount), 0)
                // Saldo en mora (estimado dinámico)
                const dailyRate = 0.001
                const saldoMora = instOverdue.reduce((acc, i) => {
                  const due = new Date(i.dueDate)
                  const today = now
                  const overdueDays = due < today ? Math.max(0, differenceInCalendarDays(today, due)) : 0
                  const remainingPI = Math.max(0, num(i.principalDue) + num(i.interestDue) - Math.min(num(i.amountPaid), num(i.interestDue)) - Math.max(0, Math.min(num(i.principalDue), num(i.amountPaid) - Math.min(num(i.amountPaid), num(i.interestDue)))))
                  const fee = remainingPI > 0 ? remainingPI * dailyRate * overdueDays : 0
                  return acc + Math.max(0, num(i.totalDue) - num(i.amountPaid)) + fee
                }, 0)
                // Aging buckets
                const buckets = { v0_30: 0, v31_60: 0, v61_90: 0, v90p: 0 }
                for (const i of instOverdue) {
                  const d = differenceInCalendarDays(now, new Date(i.dueDate))
                  const rem = Math.max(0, num(i.totalDue) - num(i.amountPaid))
                  if (d <= 30) buckets.v0_30 += rem
                  else if (d <= 60) buckets.v31_60 += rem
                  else if (d <= 90) buckets.v61_90 += rem
                  else buckets.v90p += rem
                }
                return (
                  <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Ventas hoy</div><div className="text-2xl font-bold">{currency(totalSalesToday)}</div></div>
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Ventas mes</div><div className="text-2xl font-bold">{currency(totalSalesMonth)}</div></div>
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Ticket promedio (mes)</div><div className="text-2xl font-bold">{currency(ticketAvg)}</div></div>
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Cobranzas hoy</div><div className="text-2xl font-bold">{currency(cobranzasHoy)}</div></div>
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Cobranzas mes</div><div className="text-2xl font-bold">{currency(cobranzasMes)}</div></div>
                    <div className="p-4 border rounded-md"><div className="text-sm text-muted-foreground">Saldo en mora (estimado)</div><div className="text-2xl font-bold">{currency(saldoMora)}</div></div>
                    <div className="p-4 border rounded-md col-span-1 md:col-span-3 xl:col-span-6">
                      <div className="text-sm text-muted-foreground mb-2">Aging cartera (montos)</div>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="p-3 bg-muted rounded"><div className="text-xs">0-30</div><div className="text-lg font-semibold">{currency(buckets.v0_30)}</div></div>
                        <div className="p-3 bg-muted rounded"><div className="text-xs">31-60</div><div className="text-lg font-semibold">{currency(buckets.v31_60)}</div></div>
                        <div className="p-3 bg-muted rounded"><div className="text-xs">61-90</div><div className="text-lg font-semibold">{currency(buckets.v61_90)}</div></div>
                        <div className="p-3 bg-muted rounded"><div className="text-xs">90+</div><div className="text-lg font-semibold">{currency(buckets.v90p)}</div></div>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Atajos</CardTitle>
              <CardDescription>Acciones rápidas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button onClick={() => setActiveTab('sales')}>Crear venta</Button>
              <Button variant="secondary" onClick={() => setActiveTab('sales')}>Registrar pago</Button>
              <Button variant="outline" onClick={() => setActiveTab('cobranzas')}>Cuotas que vencen hoy</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cobranzas */}
        <TabsContent value="cobranzas" className="space-y-6">
          {/* Stats KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Vencen Hoy</CardDescription>
                <CardTitle className="text-3xl">{cobranzasStats.todayCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{currency(cobranzasStats.todayAmount)}</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Cuotas Vencidas</CardDescription>
                <CardTitle className="text-3xl text-red-600">{cobranzasStats.overdueCount}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Total + Mora: <span className="font-semibold text-red-600">{currency(cobranzasStats.overdueAmount)}</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Próximos 7 Días</CardDescription>
                <CardTitle className="text-3xl text-blue-600">{cobranzasStats.next7Count}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Total: <span className="font-semibold text-foreground">{currency(cobranzasStats.next7Amount)}</span>
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Total a Gestionar</CardDescription>
                <CardTitle className="text-3xl">{cobranzasStats.todayCount + cobranzasStats.overdueCount + cobranzasStats.next7Count}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monto: <span className="font-semibold text-foreground">{currency(cobranzasStats.todayAmount + cobranzasStats.overdueAmount + cobranzasStats.next7Amount)}</span>
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Buscar por cliente..."
                  value={cobranzasSearchClient}
                  onChange={(e) => setCobranzasSearchClient(e.target.value)}
                  className="max-w-sm"
                />
                {cobranzasSearchClient && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCobranzasSearchClient("")}
                  >
                    Limpiar
                  </Button>
                )}
                <p className="text-sm text-muted-foreground ml-auto">
                  Mostrando: {filteredInstToday.length + filteredInstOverdue.length + sortedInstNext7Days.length} cuotas
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuotas que vencen hoy</CardTitle>
              <CardDescription>Prioriza estas gestiones</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>#</TableHead>
                    <TableHead>Venc.</TableHead>
                    <TableHead>Capital</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Mora</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstToday.map((i: any) => {
                    const due = new Date(i.dueDate)
                    const total = num(i.totalDue)
                    const paid = num(i.amountPaid)
                    const remaining = Math.max(0, total - paid)
                    const fee = 0
                    return (
                      <TableRow key={`t-${i.id}`}>
                        <TableCell>#{i.saleId}</TableCell>
                        <TableCell>{i.sale?.client?.name ?? i.sale?.clientId ?? '-'}</TableCell>
                        <TableCell>{i.number}</TableCell>
                        <TableCell>{formatDate(due, 'dd-MM-yy')}</TableCell>
                        <TableCell>{currency(num(i.principalDue))}</TableCell>
                        <TableCell>{currency(num(i.interestDue))}</TableCell>
                        <TableCell>{currency(fee)}</TableCell>
                        <TableCell>{currency(paid)}</TableCell>
                        <TableCell className="font-medium">{currency(remaining)}</TableCell>
                        <TableCell>{i.status}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={async () => {
                            try {
                              console.log('🔵 [1] Click en Cobrar')
                              setIsScheduleOpen(false)
                              const res = await fetch(`/api/sales/${i.saleId}`)
                              console.log('🔵 [2] Fetch response:', res.status)
                              const ok = await handleApiResponse(res)
                              if (!ok) {
                                console.log('❌ [3] handleApiResponse failed')
                                return
                              }
                              const data = await res!.json()
                              console.log('🔵 [4] Data loaded:', data.id)
                              setScheduleSale(data)
                              setPayInstallmentId(i.id)
                              setPayAmount(String(remaining.toFixed(2)))
                              setPayMethod("CASH")
                              console.log('🔵 [5] About to setIsPayOpen(true)')
                              setIsPayOpen(true)
                              console.log('🔵 [6] setIsPayOpen(true) executed')
                            } catch (error) {
                              console.error('Error in Cobrar button:', error)
                              toast({ 
                                title: "Error", 
                                description: "No se pudo cargar la información de la venta",
                                variant: "destructive" as any
                              })
                            }
                          }}>Cobrar</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredInstToday.length === 0 && (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground">Sin cuotas para hoy</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cuotas vencidas</CardTitle>
              <CardDescription>Bandeja de gestión de mora</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>#</TableHead>
                    <TableHead>Venc.</TableHead>
                    <TableHead>Atraso</TableHead>
                    <TableHead>Capital</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Mora</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredInstOverdue.map((i: any) => {
                    const due = new Date(i.dueDate)
                    const total = num(i.totalDue)
                    const paid = num(i.amountPaid)
                    const remaining = Math.max(0, total - paid)
                    const overdueDays = Math.max(0, differenceInCalendarDays(new Date(), due))
                    const dailyRate = 0.001
                    // mora dinámica sobre saldo de capital+interés pendiente
                    const interestPaidBefore = Math.min(paid, num(i.interestDue))
                    const principalPaidBefore = Math.max(0, Math.min(num(i.principalDue), paid - interestPaidBefore))
                    const remainingPI = Math.max(0, (num(i.interestDue) - interestPaidBefore) + (num(i.principalDue) - principalPaidBefore))
                    const fee = Number((remainingPI * dailyRate * overdueDays).toFixed(2))
                    return (
                      <TableRow key={`o-${i.id}`}>
                        <TableCell>#{i.saleId}</TableCell>
                        <TableCell>{i.sale?.client?.name ?? i.sale?.clientId ?? '-'}</TableCell>
                        <TableCell>{i.number}</TableCell>
                        <TableCell>{formatDate(due, 'dd-MM-yy')}</TableCell>
                        <TableCell>{overdueDays} d</TableCell>
                        <TableCell>{currency(num(i.principalDue))}</TableCell>
                        <TableCell>{currency(num(i.interestDue))}</TableCell>
                        <TableCell className="text-red-600 font-semibold">{currency(fee)}</TableCell>
                        <TableCell>{currency(paid)}</TableCell>
                        <TableCell className="font-medium">{currency(remaining + fee)}</TableCell>
                        <TableCell>{i.status}</TableCell>
                        <TableCell>
                          <Button size="sm" onClick={async () => {
                            try {
                              setIsScheduleOpen(false)
                              const res = await fetch(`/api/sales/${i.saleId}`)
                              const ok = await handleApiResponse(res)
                              if (!ok) return
                              const data = await res!.json()
                              setScheduleSale(data)
                              setPayInstallmentId(i.id)
                              setPayAmount(String((remaining + fee).toFixed(2)))
                              setPayMethod("CASH")
                              setIsPayOpen(true)
                            } catch (error) {
                              console.error('Error in Cobrar button:', error)
                              toast({ 
                                title: "Error", 
                                description: "No se pudo cargar la información de la venta",
                                variant: "destructive" as any
                              })
                            }
                          }}>Cobrar</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredInstOverdue.length === 0 && (
                    <TableRow><TableCell colSpan={12} className="text-center text-muted-foreground">No hay vencidas</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Nueva tabla: Próximos 7 días */}
          <Card>
            <CardHeader>
              <CardTitle>Próximos 7 días</CardTitle>
              <CardDescription>Planifica tus gestiones de cobranza</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>#</TableHead>
                    <TableHead>Venc.</TableHead>
                    <TableHead>Días</TableHead>
                    <TableHead>Capital</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Pagado</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedInstNext7Days.map((i: any) => {
                    const due = new Date(i.dueDate)
                    const total = num(i.totalDue)
                    const paid = num(i.amountPaid)
                    const remaining = Math.max(0, total - paid)
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const daysUntil = differenceInCalendarDays(due, today)
                    return (
                      <TableRow key={`n7-${i.id}`}>
                        <TableCell>#{i.saleId}</TableCell>
                        <TableCell>{i.sale?.client?.name ?? i.sale?.clientId ?? '-'}</TableCell>
                        <TableCell>{i.number}</TableCell>
                        <TableCell>{formatDate(due, 'dd-MM-yy')}</TableCell>
                        <TableCell className="text-blue-600 font-medium">en {daysUntil} d</TableCell>
                        <TableCell>{currency(num(i.principalDue))}</TableCell>
                        <TableCell>{currency(num(i.interestDue))}</TableCell>
                        <TableCell>{currency(paid)}</TableCell>
                        <TableCell className="font-medium">{currency(remaining)}</TableCell>
                        <TableCell>{i.status}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={async () => {
                            const res = await fetch(`/api/sales/${i.saleId}`)
                            const ok = await handleApiResponse(res)
                            if (!ok) return
                            const data = await res!.json()
                            setScheduleSale(data)
                            setIsScheduleOpen(true)
                          }}>Ver</Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {sortedInstNext7Days.length === 0 && (
                    <TableRow><TableCell colSpan={11} className="text-center text-muted-foreground">No hay cuotas en los próximos 7 días</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

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
                  {isUploading ? `Subiendo... ${uploadProgress}%` : "Guardar Producto"}
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
                  {isUploading ? `Subiendo... ${uploadProgress}%` : "Guardar Cambios"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

      {/* Financing Methods Tab */}
      <TabsContent value="financing" className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold">Métodos de Financiamiento</h2>
                <Button onClick={() => setIsAddingMethod(true)}>
                  <Plus className="w-4 h-4 mr-2" /> Nuevo método
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Lista</CardTitle>
                  <CardDescription>Define planes en cuotas, intereses y condiciones</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Descripción</TableHead>
                        <TableHead>Interés</TableHead>
                        <TableHead>Cuotas</TableHead>
                        <TableHead>Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {financingMethods.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell className="max-w-[320px] truncate">{m.description || "—"}</TableCell>
                          <TableCell>{(m.interestRate * 100).toFixed(2)}%</TableCell>
                          <TableCell>{m.installments}x</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => setEditingMethod(m)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={async () => {
                                if (!confirm(`¿Eliminar método "${m.name}"?`)) return
                                const res = await fetch(`/api/financing/${m.id}`, { method: 'DELETE' })
                                const ok = await handleApiResponse(res, { success: 'Método eliminado' })
                                if (ok) setFinancingMethods((prev) => prev.filter((x) => x.id !== m.id))
                              }}>
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {financingMethods.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">Sin métodos aún</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Add Method Dialog */}
              <Dialog open={isAddingMethod} onOpenChange={setIsAddingMethod}>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Nuevo Método de Financiamiento</DialogTitle>
                    <DialogDescription>Define nombre, interés y cantidad de cuotas</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="new-method-name">Nombre *</Label>
                      <Input 
                        id="new-method-name"
                        placeholder="Ej: 12 cuotas sin interés"
                        onChange={(e) => setEditingMethod({ id: 0, name: e.target.value, interestRate: 0, installments: 1 })} 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-method-interest">Interés (%)</Label>
                        <Input 
                          id="new-method-interest"
                          type="number" 
                          step="0.01" 
                          min="0"
                          placeholder="0.00"
                          onChange={(e) => setEditingMethod((prev) => ({ 
                            ...(prev || { id: 0, name: '', interestRate: 0, installments: 1 }), 
                            interestRate: Number(e.target.value) / 100 
                          }))} 
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Ejemplo: 15 para 15%
                        </p>
                      </div>
                      <div>
                        <Label htmlFor="new-method-installments">Cuotas *</Label>
                        <Input 
                          id="new-method-installments"
                          type="number" 
                          min="1" 
                          placeholder="12"
                          onChange={(e) => setEditingMethod((prev) => ({ 
                            ...(prev || { id: 0, name: '', interestRate: 0, installments: 1 }), 
                            installments: Number(e.target.value) 
                          }))} 
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="new-method-description">Descripción (opcional)</Label>
                      <Textarea 
                        id="new-method-description"
                        rows={3} 
                        placeholder="Detalles adicionales sobre el método de financiamiento..."
                        onChange={(e) => setEditingMethod((prev) => ({ 
                          ...(prev || { id: 0, name: '', interestRate: 0, installments: 1 }), 
                          description: e.target.value 
                        }))} 
                      />
                    </div>
                    {editingMethod && editingMethod.name && (
                      <div className="p-3 bg-muted rounded-md">
                        <div className="text-sm font-medium mb-1">Vista previa:</div>
                        <div className="font-medium">{editingMethod.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {editingMethod.installments || 1} cuotas · {((editingMethod.interestRate || 0) * 100).toFixed(2)}% interés
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-6">
                    <Button 
                      onClick={async () => {
                        if (!editingMethod?.name?.trim()) {
                          toast({ title: "Error", description: "El nombre es requerido", variant: "destructive" as any })
                          return
                        }
                        const body = { 
                          name: editingMethod.name.trim(), 
                          description: editingMethod.description, 
                          interestRate: editingMethod.interestRate || 0, 
                          installments: editingMethod.installments || 1 
                        }
                        const res = await fetch('/api/financing', { 
                          method: 'POST', 
                          headers: { 'Content-Type': 'application/json' }, 
                          body: JSON.stringify(body) 
                        })
                        const ok = await handleApiResponse(res, { success: 'Método de financiamiento creado' })
                        if (ok) {
                          const created = await res!.json()
                          setFinancingMethods((prev) => [created, ...prev])
                          // Auto-select the newly created method in the sale draft
                          setSaleDraft((prev) => ({ ...prev, financingMethodId: created.id }))
                          setEditingMethod(null)
                          setIsAddingMethod(false)
                        }
                      }}
                      disabled={!editingMethod?.name?.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" /> Guardar y usar
                    </Button>
                    <Button variant="outline" onClick={() => { setEditingMethod(null); setIsAddingMethod(false) }}>
                      <X className="w-4 h-4 mr-2" /> Cancelar
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Edit Method Dialog */}
              <Dialog open={!!editingMethod && !isAddingMethod} onOpenChange={() => setEditingMethod(null)}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Editar método</DialogTitle>
                    <DialogDescription>Actualiza los datos del plan</DialogDescription>
                  </DialogHeader>
                  {editingMethod && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label>Nombre</Label>
                        <Input value={editingMethod.name} onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })} />
                      </div>
                      <div>
                        <Label>Interés (%)</Label>
                        <Input type="number" step="0.01" value={String((editingMethod.interestRate ?? 0) * 100)} onChange={(e) => setEditingMethod({ ...editingMethod, interestRate: Number(e.target.value) / 100 })} />
                      </div>
                      <div>
                        <Label>Cuotas</Label>
                        <Input type="number" min="1" value={String(editingMethod.installments ?? 1)} onChange={(e) => setEditingMethod({ ...editingMethod, installments: Number(e.target.value) })} />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Descripción</Label>
                        <Textarea rows={3} value={editingMethod.description || ''} onChange={(e) => setEditingMethod({ ...editingMethod, description: e.target.value })} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-2 mt-6">
                    <Button onClick={async () => {
                      if (!editingMethod) return
                      const body = { name: editingMethod.name, description: editingMethod.description, interestRate: editingMethod.interestRate, installments: editingMethod.installments }
                      const res = await fetch(`/api/financing/${editingMethod.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                      const ok = await handleApiResponse(res, { success: 'Método actualizado' })
                      if (ok) {
                        const updated = await res!.json()
                        setFinancingMethods((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
                        setEditingMethod(null)
                      }
                    }}>
                      <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                    </Button>
                    <Button variant="outline" onClick={() => setEditingMethod(null)}>
                      <X className="w-4 h-4 mr-2" /> Cancelar
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
  {/* Clients Tab */}
  <TabsContent value="clients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Clientes</h2>
            <Button onClick={() => setIsAddingClient(true)}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Cliente
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Lista de Clientes</CardTitle>
              <CardDescription>Gestiona tus clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>DNI</TableHead>
                    <TableHead>CUIT</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Teléfono</TableHead>
                    <TableHead>Mora</TableHead>
                    <TableHead>Creado</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((c) => {
                    const hasMora = (c.moraTotal || 0) > 0
                    return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.name}</TableCell>
                      <TableCell>{c.dni || "—"}</TableCell>
                      <TableCell>{c.cuit || "—"}</TableCell>
                      <TableCell>{c.email || "—"}</TableCell>
                      <TableCell>{c.phone || "—"}</TableCell>
                      <TableCell>
                        {hasMora ? (
                          <Badge variant="destructive" className="font-semibold">
                            {currency(c.moraTotal || 0)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="outline">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={async () => {
                              const res = await fetch(`/api/clients/${c.id}`)
                              const ok = await handleApiResponse(res)
                              if (!ok) return
                              const data = await res!.json()
                              setClientHistory(data)
                              setIsHistoryOpen(true)
                            }}>
                              <FileText className="w-4 h-4 mr-2" /> Ver historial completo
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEditingClient(c)}>
                              <Edit className="w-4 h-4 mr-2" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              const details = `Cliente: ${c.name}\nDNI: ${c.dni || '—'}\nCUIT: ${c.cuit || '—'}\nEmail: ${c.email || '—'}\nTeléfono: ${c.phone || '—'}\nNotas: ${c.notes || '—'}`
                              toast({ title: "Vista rápida", description: details })
                            }}>
                              <Eye className="w-4 h-4 mr-2" /> Vista rápida
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem disabled={!c.email} onClick={() => c.email && copyToClipboard(c.email, "Email")}>
                              <Mail className="w-4 h-4 mr-2" /> Copiar email
                            </DropdownMenuItem>
                            <DropdownMenuItem disabled={!c.phone} onClick={() => c.phone && copyToClipboard(c.phone, "Teléfono")}>
                              <PhoneIcon className="w-4 h-4 mr-2" /> Copiar teléfono
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => exportClientJson(c)}>
                              <Download className="w-4 h-4 mr-2" /> Exportar JSON
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportClientCsv(c)}>
                              <Download className="w-4 h-4 mr-2" /> Exportar CSV
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={async () => {
                              if (!confirm(`¿Eliminar cliente "${c.name}"? Esta acción no se puede deshacer.`)) return
                              const res = await fetch(`/api/clients/${c.id}`, { method: 'DELETE' })
                              const ok = await handleApiResponse(res, { success: 'Cliente eliminado' })
                              if (ok) setClients((prev) => prev.filter((x) => x.id !== c.id))
                            }}>
                              <Trash2 className="w-4 h-4 mr-2" /> Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    )
                  })}
                  {clients.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground">Sin clientes todavía</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Add Client Dialog */}
          <Dialog open={isAddingClient} onOpenChange={setIsAddingClient}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Cliente</DialogTitle>
                <DialogDescription>Registra un nuevo cliente</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="client-name">Nombre</Label>
                  <Input id="client-name" onChange={(e) => setEditingClient({ id: 0, name: e.target.value })} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="client-dni">DNI</Label>
                    <Input id="client-dni" onChange={(e) => setEditingClient((prev) => ({ ...(prev || { id: 0, name: "" }), dni: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="client-cuit">CUIT</Label>
                    <Input id="client-cuit" onChange={(e) => setEditingClient((prev) => ({ ...(prev || { id: 0, name: "" }), cuit: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="client-email">Email</Label>
                    <Input id="client-email" onChange={(e) => setEditingClient((prev) => ({ ...(prev || { id: 0, name: "" }), email: e.target.value }))} />
                  </div>
                  <div>
                    <Label htmlFor="client-phone">Teléfono</Label>
                    <Input id="client-phone" onChange={(e) => setEditingClient((prev) => ({ ...(prev || { id: 0, name: "" }), phone: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="client-notes">Notas</Label>
                  <Textarea id="client-notes" rows={3} onChange={(e) => setEditingClient((prev) => ({ ...(prev || { id: 0, name: "" }), notes: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <Button
                  onClick={async () => {
                    if (!editingClient?.name?.trim()) return
                    const body = {
                      name: editingClient.name.trim(),
                      dni: editingClient.dni,
                      cuit: editingClient.cuit,
                      email: editingClient.email,
                      phone: editingClient.phone,
                      notes: editingClient.notes,
                    }
                    const res = await fetch("/api/clients", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                    const ok = await handleApiResponse(res, { success: "Cliente creado" })
                    if (ok) {
                      const created = await res!.json()
                      setClients((prev) => [created, ...prev])
                      setEditingClient(null)
                      setIsAddingClient(false)
                    }
                  }}
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar Cliente
                </Button>
                <Button variant="outline" onClick={() => { setEditingClient(null); setIsAddingClient(false) }}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Client Dialog */}
          <Dialog open={!!editingClient && !isAddingClient} onOpenChange={() => setEditingClient(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Editar Cliente</DialogTitle>
                <DialogDescription>Modifica la información del cliente</DialogDescription>
              </DialogHeader>
              {editingClient && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="edit-client-name">Nombre</Label>
                    <Input id="edit-client-name" value={editingClient.name} onChange={(e) => setEditingClient({ ...editingClient, name: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-client-dni">DNI</Label>
                      <Input id="edit-client-dni" value={editingClient.dni || ""} onChange={(e) => setEditingClient({ ...editingClient, dni: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="edit-client-cuit">CUIT</Label>
                      <Input id="edit-client-cuit" value={editingClient.cuit || ""} onChange={(e) => setEditingClient({ ...editingClient, cuit: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="edit-client-email">Email</Label>
                      <Input id="edit-client-email" value={editingClient.email || ""} onChange={(e) => setEditingClient({ ...editingClient, email: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="edit-client-phone">Teléfono</Label>
                      <Input id="edit-client-phone" value={editingClient.phone || ""} onChange={(e) => setEditingClient({ ...editingClient, phone: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="edit-client-notes">Notas</Label>
                    <Textarea id="edit-client-notes" rows={3} value={editingClient.notes || ""} onChange={(e) => setEditingClient({ ...editingClient, notes: e.target.value })} />
                  </div>
                </div>
              )}
              <div className="flex gap-2 mt-6">
                <Button onClick={async () => {
                  if (!editingClient) return
                  const body = { name: editingClient.name, dni: editingClient.dni, cuit: editingClient.cuit, email: editingClient.email, phone: editingClient.phone, notes: editingClient.notes }
                  const res = await fetch(`/api/clients/${editingClient.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
                  const ok = await handleApiResponse(res, { success: "Cliente actualizado" })
                  if (ok) {
                    const updated = await res!.json()
                    setClients((prev) => prev.map((c) => (c.id === updated.id ? updated : c)))
                    setEditingClient(null)
                  }
                }}>
                  <Save className="w-4 h-4 mr-2" /> Guardar Cambios
                </Button>
                <Button variant="outline" onClick={() => setEditingClient(null)}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Client History Dialog */}
          <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Historial Completo del Cliente</DialogTitle>
                <DialogDescription>
                  {clientHistory ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-lg">{clientHistory.name}</span>
                      <div className="text-sm text-muted-foreground">
                        {clientHistory.dni && <span>DNI: {clientHistory.dni} · </span>}
                        {clientHistory.cuit && <span>CUIT: {clientHistory.cuit} · </span>}
                        {clientHistory.email && <span>{clientHistory.email} · </span>}
                        {clientHistory.phone && <span>{clientHistory.phone}</span>}
                      </div>
                    </div>
                  ) : 'Cargando...'}
                </DialogDescription>
              </DialogHeader>

              {clientHistory && (
                <div className="space-y-6">
                  {/* Resumen */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Resumen</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground">Total Ventas</div>
                          <div className="text-xl font-bold">{(clientHistory.sales || []).length}</div>
                        </div>
                        <div className="p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground">Facturado</div>
                          <div className="text-xl font-bold">
                            {currency((clientHistory.sales || []).reduce((acc, s) => acc + num(s.total), 0))}
                          </div>
                        </div>
                        <div className="p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground">Cobrado</div>
                          <div className="text-xl font-bold">
                            {currency((clientHistory.sales || []).reduce((acc, s) => acc + (s.payments || []).reduce((a, p) => a + num(p.amount), 0), 0))}
                          </div>
                        </div>
                        <div className="p-3 border rounded-md">
                          <div className="text-sm text-muted-foreground">Mora Acumulada</div>
                          <div className="text-xl font-bold text-red-600">
                            {currency((clientHistory.sales || []).reduce((acc, s) => acc + (s.installments || []).reduce((a, i) => a + num(i.amountPaid), 0), 0) > 0 ? (clientHistory.moraTotal || 0) : 0)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Ventas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Ventas ({(clientHistory.sales || []).length})</h3>
                    {(clientHistory.sales || []).length === 0 && (
                      <p className="text-muted-foreground text-center py-8">Sin ventas registradas</p>
                    )}
                    {(clientHistory.sales || []).map((sale) => {
                      const totalPagado = (sale.payments || []).reduce((a, p) => a + num(p.amount), 0)
                      const totalVenta = num(sale.total)
                      const saldo = Math.max(0, totalVenta - totalPagado)
                      const cuotasPendientes = (sale.installments || []).filter(i => i.status !== 'PAID').length
                      const cuotasVencidas = (sale.installments || []).filter(i => i.status === 'OVERDUE').length
                      return (
                        <Card key={sale.id} className="overflow-hidden">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">Venta #{sale.id}</CardTitle>
                                <CardDescription>
                                  {formatDate(new Date(sale.createdAt), 'dd-MM-yy HH:mm')} · {sale.financingMethod?.name || 'N/A'}
                                </CardDescription>
                              </div>
                              <Badge variant={sale.status === 'ACTIVE' ? 'default' : sale.status === 'COMPLETED' ? 'secondary' : 'outline'}>
                                {sale.status}
                              </Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            {/* Totales de la venta */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="ml-2 font-semibold">{currency(num(sale.subtotal))}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Interés:</span>
                                <span className="ml-2 font-semibold">{currency(num(sale.interest))}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Total:</span>
                                <span className="ml-2 font-semibold">{currency(totalVenta)}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Saldo:</span>
                                <span className="ml-2 font-semibold text-orange-600">{currency(saldo)}</span>
                              </div>
                            </div>

                            {/* Tabs internos para Cuotas y Pagos */}
                            <Tabs defaultValue="cuotas" className="w-full">
                              <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="cuotas">
                                  Cuotas ({(sale.installments || []).length})
                                  {cuotasVencidas > 0 && (
                                    <Badge variant="destructive" className="ml-2 text-xs">{cuotasVencidas} vencidas</Badge>
                                  )}
                                </TabsTrigger>
                                <TabsTrigger value="pagos">Pagos ({(sale.payments || []).length})</TabsTrigger>
                              </TabsList>

                              <TabsContent value="cuotas" className="mt-3">
                                {(sale.installments || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">Sin cuotas</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead className="w-12">#</TableHead>
                                          <TableHead>Vencimiento</TableHead>
                                          <TableHead>Monto</TableHead>
                                          <TableHead>Pagado</TableHead>
                                          <TableHead>Saldo</TableHead>
                                          <TableHead>Estado</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(sale.installments || []).map((inst) => {
                                          const totalDue = num(inst.totalDue)
                                          const paid = num(inst.amountPaid)
                                          const remaining = Math.max(0, totalDue - paid)
                                          return (
                                            <TableRow key={inst.id}>
                                              <TableCell className="font-mono">{inst.number}</TableCell>
                                              <TableCell>{formatDate(new Date(inst.dueDate), 'dd-MM-yy')}</TableCell>
                                              <TableCell>{currency(totalDue)}</TableCell>
                                              <TableCell>{currency(paid)}</TableCell>
                                              <TableCell className="font-semibold">{currency(remaining)}</TableCell>
                                              <TableCell>
                                                <Badge variant={
                                                  inst.status === 'PAID' ? 'default' :
                                                  inst.status === 'OVERDUE' ? 'destructive' :
                                                  inst.status === 'PARTIAL' ? 'secondary' : 'outline'
                                                }>
                                                  {inst.status}
                                                </Badge>
                                              </TableCell>
                                            </TableRow>
                                          )
                                        })}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </TabsContent>

                              <TabsContent value="pagos" className="mt-3">
                                {(sale.payments || []).length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">Sin pagos registrados</p>
                                ) : (
                                  <div className="overflow-x-auto">
                                    <Table>
                                      <TableHeader>
                                        <TableRow>
                                          <TableHead>Fecha</TableHead>
                                          <TableHead>Monto</TableHead>
                                          <TableHead>Método</TableHead>
                                          <TableHead>Capital</TableHead>
                                          <TableHead>Interés</TableHead>
                                          <TableHead>Mora</TableHead>
                                        </TableRow>
                                      </TableHeader>
                                      <TableBody>
                                        {(sale.payments || []).map((pay) => (
                                          <TableRow key={pay.id}>
                                            <TableCell>{formatDate(new Date(pay.date), 'dd-MM-yy HH:mm')}</TableCell>
                                            <TableCell className="font-semibold">{currency(num(pay.amount))}</TableCell>
                                            <TableCell>
                                              <Badge variant="outline">{pay.method}</Badge>
                                            </TableCell>
                                            <TableCell>{currency(num(pay.appliedPrincipal))}</TableCell>
                                            <TableCell>{currency(num(pay.appliedInterest))}</TableCell>
                                            <TableCell className="text-red-600">{currency(num(pay.appliedFees))}</TableCell>
                                          </TableRow>
                                        ))}
                                      </TableBody>
                                    </Table>
                                  </div>
                                )}
                              </TabsContent>
                            </Tabs>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setIsHistoryOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
  </TabsContent>

  {/* Payments Tab */}
  <TabsContent value="payments" className="space-y-6">
          <h2 className="text-2xl font-semibold">Historial de Pagos</h2>

          {/* Filtros */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                <Input
                  placeholder="Buscar por cliente..."
                  value={paymentsSearchClient}
                  onChange={(e) => setPaymentsSearchClient(e.target.value)}
                />
                <Select value={paymentsFilterMethod} onValueChange={setPaymentsFilterMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Método de pago" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los métodos</SelectItem>
                    <SelectItem value="CASH">Efectivo</SelectItem>
                    <SelectItem value="TRANSFER">Transferencia</SelectItem>
                    <SelectItem value="CHECK">Cheque</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  placeholder="Desde"
                  value={paymentsFilterDateFrom}
                  onChange={(e) => setPaymentsFilterDateFrom(e.target.value)}
                />
                <Input
                  type="date"
                  placeholder="Hasta"
                  value={paymentsFilterDateTo}
                  onChange={(e) => setPaymentsFilterDateTo(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">
                  Mostrando {filteredPayments.length} de {realPayments.length} pagos
                </p>
                {(paymentsSearchClient || paymentsFilterMethod !== "all" || paymentsFilterDateFrom || paymentsFilterDateTo) && (
                  <Button variant="ghost" size="sm" onClick={clearPaymentsFilters}>
                    Limpiar filtros
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Todos los Pagos Registrados</CardTitle>
              <CardDescription>Historial completo con desglose de aplicación</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Venta</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Cuota</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Capital</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Mora</TableHead>
                    <TableHead>Referencia</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((p) => {
                    const amt = num(p.amount)
                    const principal = num(p.appliedPrincipal)
                    const interest = num(p.appliedInterest)
                    const fees = num(p.appliedFees)
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-mono">#{p.id}</TableCell>
                        <TableCell>{formatDate(new Date(p.date), 'dd-MM-yy HH:mm')}</TableCell>
                        <TableCell className="font-mono">#{p.saleId}</TableCell>
                        <TableCell>{p.sale?.client?.name || `Cliente #${p.sale?.clientId}` || '—'}</TableCell>
                        <TableCell>{p.installment ? `Cuota ${p.installment.number}` : 'Auto-asignado'}</TableCell>
                        <TableCell className="font-semibold">{currency(amt)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{p.method}</Badge>
                        </TableCell>
                        <TableCell>{currency(principal)}</TableCell>
                        <TableCell>{currency(interest)}</TableCell>
                        <TableCell className="text-red-600">{currency(fees)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{p.reference || p.notes || '—'}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={async () => {
                            const res = await fetch(`/api/sales/${p.saleId}`)
                            const ok = await handleApiResponse(res)
                            if (!ok) return
                            const data = await res!.json()
                            setScheduleSale(data)
                            setIsScheduleOpen(true)
                          }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredPayments.length === 0 && realPayments.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                        No hay pagos que coincidan con los filtros aplicados.
                      </TableCell>
                    </TableRow>
                  )}
                  {realPayments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={12} className="text-center text-muted-foreground py-8">
                        Sin pagos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

  {/* Sales Tab */}
  <TabsContent value="sales" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Gestión de Ventas</h2>
          </div>

          {/* Filters Card */}
          <Card>
            <CardContent className="pt-4 pb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Label htmlFor="sales-search">Buscar (ID o Cliente)</Label>
                  <Input
                    id="sales-search"
                    placeholder="Buscar por ID o nombre de cliente..."
                    value={salesSearchTerm}
                    onChange={(e) => setSalesSearchTerm(e.target.value)}
                  />
                </div>

                {/* Client Filter */}
                <div>
                  <Label htmlFor="sales-filter-client">Cliente</Label>
                  <Select value={salesFilterClient} onValueChange={setSalesFilterClient}>
                    <SelectTrigger id="sales-filter-client">
                      <SelectValue placeholder="Todos los clientes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los clientes</SelectItem>
                      {clients.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Financing Method Filter */}
                <div>
                  <Label htmlFor="sales-filter-method">Método de Financiamiento</Label>
                  <Select value={salesFilterMethod} onValueChange={setSalesFilterMethod}>
                    <SelectTrigger id="sales-filter-method">
                      <SelectValue placeholder="Todos los métodos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos los métodos</SelectItem>
                      {financingMethods.map((m) => (
                        <SelectItem key={m.id} value={String(m.id)}>
                          {m.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div>
                  <Label htmlFor="sales-date-from">Fecha desde</Label>
                  <Input
                    id="sales-date-from"
                    type="date"
                    value={salesFilterDateFrom}
                    onChange={(e) => setSalesFilterDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div>
                  <Label htmlFor="sales-date-to">Fecha hasta</Label>
                  <Input
                    id="sales-date-to"
                    type="date"
                    value={salesFilterDateTo}
                    onChange={(e) => setSalesFilterDateTo(e.target.value)}
                  />
                </div>

                {/* Min Amount */}
                <div>
                  <Label htmlFor="sales-min-amount">Monto mínimo</Label>
                  <Input
                    id="sales-min-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={salesFilterMinAmount}
                    onChange={(e) => setSalesFilterMinAmount(e.target.value)}
                  />
                </div>

                {/* Max Amount */}
                <div>
                  <Label htmlFor="sales-max-amount">Monto máximo</Label>
                  <Input
                    id="sales-max-amount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={salesFilterMaxAmount}
                    onChange={(e) => setSalesFilterMaxAmount(e.target.value)}
                  />
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="text-sm text-muted-foreground">
                  Mostrando {filteredSales.length} de {sales.length} ventas
                </div>
                <Button variant="outline" size="sm" onClick={clearSalesFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Limpiar filtros
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Listado de Ventas</CardTitle>
                  <CardDescription>Incluye cliente, método y totales</CardDescription>
                </div>
                <Button onClick={() => { setIsAddingSale(true); setSaleDraft({ items: [] }) }}>
                  <Plus className="w-4 h-4 mr-2" /> Nueva venta
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Método</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead>Interés</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono">{s.id}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {s.createdAt ? formatDate(new Date(s.createdAt), 'dd-MM-yy') : '—'}
                      </TableCell>
                      <TableCell>{s.client?.name || s.clientId}</TableCell>
                      <TableCell>{s.financingMethod?.name || s.financingMethodId}</TableCell>
                      <TableCell>${typeof s.subtotal === 'number' ? s.subtotal.toFixed(2) : s.subtotal}</TableCell>
                      <TableCell>${typeof s.interest === 'number' ? s.interest.toFixed(2) : s.interest}</TableCell>
                      <TableCell className="font-semibold">${typeof s.total === 'number' ? s.total.toFixed(2) : s.total}</TableCell>
                      <TableCell className="space-x-2 text-right">
                        <Button size="sm" variant="secondary" onClick={async () => {
                          const res = await fetch(`/api/sales/${s.id}`)
                          const ok = await handleApiResponse(res)
                          if (!ok) return
                          const data = await res!.json()
                          setScheduleSale(data)
                          setIsScheduleOpen(true)
                        }}>
                          <CalendarClock className="w-4 h-4 mr-1" /> Cronograma
                        </Button>
                        <Button size="sm" onClick={async () => {
                          const res = await fetch(`/api/sales/${s.id}`)
                          const ok = await handleApiResponse(res)
                          if (!ok) return
                          const data = await res!.json()
                          setScheduleSale(data)
                          setPayInstallmentId(undefined)
                          setPayAmount("")
                          setPayMethod("CASH")
                          setIsPayOpen(true)
                        }}>
                          <DollarSign className="w-4 h-4 mr-1" /> Registrar pago
                        </Button>
                        <Button size="sm" variant="destructive" onClick={async () => {
                          if (!confirm(`¿Eliminar venta #${s.id}?`)) return
                          const res = await fetch(`/api/sales/${s.id}`, { method: 'DELETE' })
                          const ok = await handleApiResponse(res, { success: 'Venta eliminada' })
                          if (ok) setSales((prev) => prev.filter((x) => x.id !== s.id))
                        }}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSales.length === 0 && sales.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">Sin ventas</TableCell>
                    </TableRow>
                  )}
                  {filteredSales.length === 0 && sales.length > 0 && (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                        No se encontraron ventas con los filtros aplicados. 
                        <Button variant="link" className="p-0 ml-1" onClick={clearSalesFilters}>
                          Limpiar filtros
                        </Button>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ========== ALL DIALOGS (OUTSIDE TabsContent) ========== */}
        
        {/* Schedule Dialog */}
        <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Cronograma de cuotas</DialogTitle>
                <DialogDescription>
                  {scheduleSale ? (
                    <span>
                      Venta #{scheduleSale.id} · Cliente: {scheduleSale.client?.name ?? scheduleSale.clientId}
                    </span>
                  ) : 'Cargando...'}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>#</TableHead>
                      <TableHead>Vencimiento</TableHead>
                      <TableHead>Capital</TableHead>
                      <TableHead>Interés</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Pagado</TableHead>
                      <TableHead>Saldo</TableHead>
                      <TableHead>Mora</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(scheduleSale?.installments ?? []).map((inst: any) => {
                      const today = new Date()
                      const due = new Date(inst.dueDate)
                      const totalDue = Number(inst.totalDue)
                      const paid = Number(inst.amountPaid)
                      const remaining = Math.max(0, totalDue - paid)
                      const overdueDays = remaining > 0 && due < today ? Math.max(0, differenceInCalendarDays(today, due)) : 0
                      const dailyRate = 0.001 // 0.1% diario (ajustable)
                      const mora = Number((remaining * dailyRate * overdueDays).toFixed(2))
                      const state = remaining === 0 ? 'PAID' : (overdueDays > 0 ? 'OVERDUE' : (inst.status || 'PENDING'))
                      const fmt = (n: any) => typeof n === 'number' ? n.toFixed(2) : n
                      return (
                        <TableRow key={inst.id} className={overdueDays > 0 && remaining > 0 ? 'bg-red-500/5' : ''}>
                          <TableCell className="font-mono">{inst.number}</TableCell>
                          <TableCell>{formatDate(due, 'dd-MM-yy')}</TableCell>
                          <TableCell>${fmt(Number(inst.principalDue))}</TableCell>
                          <TableCell>${fmt(Number(inst.interestDue))}</TableCell>
                          <TableCell className="font-medium">${fmt(totalDue)}</TableCell>
                          <TableCell>${fmt(paid)}</TableCell>
                          <TableCell>${fmt(remaining)}</TableCell>
                          <TableCell className={mora > 0 ? 'text-red-500 font-semibold' : ''}>${fmt(mora)}</TableCell>
                          <TableCell>{state}</TableCell>
                        </TableRow>
                      )
                    })}
                    {(!scheduleSale?.installments || scheduleSale.installments.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center text-muted-foreground">Sin cuotas</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Payment Dialog */}
          <Dialog open={isPayOpen} onOpenChange={(open) => {
            console.log('🟣 Payment Dialog onOpenChange called with:', open)
            setIsPayOpen(open)
          }}>
            <DialogContent className="max-w-md">
              {console.log('🟣 Payment Dialog DialogContent rendering')}
              <DialogHeader>
                <DialogTitle>Registrar pago</DialogTitle>
                <DialogDescription>
                  {scheduleSale ? (
                    <span>
                      Venta #{scheduleSale.id} · {scheduleSale.client?.name ?? scheduleSale.clientId}
                    </span>
                  ) : 'Cargando...'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Monto</Label>
                  <Input type="number" min="0" step="0.01" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="0.00" />
                </div>
                <div>
                  <Label>Método</Label>
                  <Select value={payMethod} onValueChange={setPayMethod}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar método" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CASH">Efectivo</SelectItem>
                      <SelectItem value="TRANSFER">Transferencia</SelectItem>
                      <SelectItem value="CARD">Tarjeta</SelectItem>
                      <SelectItem value="MP">Mercado Pago</SelectItem>
                      <SelectItem value="STRIPE">Stripe</SelectItem>
                      <SelectItem value="OTHER">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Cuota (opcional)</Label>
                  <Select
                    value={payInstallmentId ? String(payInstallmentId) : "__none"}
                    onValueChange={(v) => {
                      if (v === "__none") {
                        setPayInstallmentId(undefined)
                        return
                      }
                      setPayInstallmentId(v ? Number(v) : undefined)
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Sin asignar (automático)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none">Sin asignar</SelectItem>
                      {(scheduleSale?.installments ?? []).map((inst: any) => {
                        const total = Number(inst.totalDue)
                        const paid = Number(inst.amountPaid)
                        const remaining = Math.max(0, total - paid)
                        return (
                          <SelectItem key={inst.id} value={String(inst.id)}>
                            #{inst.number} · Vence {formatDate(new Date(inst.dueDate), 'dd-MM-yy')} · Saldo ${remaining.toFixed(2)}
                          </SelectItem>
                        )
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsPayOpen(false)}>Cancelar</Button>
                <Button
                  onClick={async () => {
                    const amount = parseAmount(payAmount)
                    if (!scheduleSale?.id) return
                    if (!Number.isFinite(amount) || amount <= 0) {
                      toast({ title: 'Monto inválido', variant: 'destructive' as any })
                      return
                    }
                    const res = await fetch('/api/payments', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        saleId: scheduleSale.id,
                        installmentId: payInstallmentId,
                        amount,
                        method: payMethod,
                      })
                    })
                    const ok = await handleApiResponse(res, { success: 'Pago registrado' })
                    if (!ok) return
                    // Refresh schedule data
                    const res2 = await fetch(`/api/sales/${scheduleSale.id}`)
                    const ok2 = await handleApiResponse(res2)
                    if (!ok2) return
                    const data = await res2!.json()
                    setScheduleSale(data)
                    setIsPayOpen(false)
                    setPayInstallmentId(undefined)
                    setPayAmount("")
                    setPayMethod("CASH")
                  }}
                >
                  Guardar pago
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Add Sale Dialog */}
          {/* New Sale Dialog - IMPROVED */}
          <Dialog open={isAddingSale} onOpenChange={(open) => {
            setIsAddingSale(open)
            if (!open) setClientSearchTerm("") // Reset search when closing
          }}>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Nueva Venta</DialogTitle>
                <DialogDescription>Completa los datos para registrar una nueva venta</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Cliente y Método - Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Información General</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Cliente con búsqueda */}
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="sale-client">Cliente *</Label>
                        <div className="space-y-2">
                          <Input
                            id="sale-client-search"
                            placeholder="Buscar por nombre o DNI..."
                            value={clientSearchTerm}
                            onChange={(e) => setClientSearchTerm(e.target.value)}
                            className="mb-2"
                          />
                          <Select 
                            value={saleDraft.clientId ? String(saleDraft.clientId) : ''} 
                            onValueChange={(v) => {
                              setSaleDraft((prev) => ({ ...prev, clientId: Number(v) }))
                              setClientSearchTerm("") // Clear search after selection
                            }}
                          >
                            <SelectTrigger id="sale-client">
                              <SelectValue placeholder="Seleccionar cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {filteredClientsForSale.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                  No se encontraron clientes
                                </div>
                              ) : (
                                filteredClientsForSale.map((c) => (
                                  <SelectItem key={c.id} value={String(c.id)}>
                                    <div className="flex items-center justify-between gap-2">
                                      <span className="font-medium">{c.name}</span>
                                      {c.dni && (
                                        <span className="text-xs text-muted-foreground">DNI: {c.dni}</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                          {saleDraft.clientId && (() => {
                            const selectedClient = clients.find(c => c.id === saleDraft.clientId)
                            return selectedClient ? (
                              <div className="text-sm p-3 bg-muted rounded-md">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div>
                                    <div className="text-xs text-muted-foreground mb-1">Nombre</div>
                                    <div className="font-medium">{selectedClient.name}</div>
                                  </div>
                                  {selectedClient.dni && (
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">DNI</div>
                                      <div className="font-medium">{selectedClient.dni}</div>
                                    </div>
                                  )}
                                  {selectedClient.email && (
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Email</div>
                                      <div className="font-medium truncate">{selectedClient.email}</div>
                                    </div>
                                  )}
                                  {selectedClient.phone && (
                                    <div>
                                      <div className="text-xs text-muted-foreground mb-1">Teléfono</div>
                                      <div className="font-medium">{selectedClient.phone}</div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ) : null
                          })()}
                        </div>
                      </div>

                      {/* Método de financiamiento */}
                      <div className="space-y-2 md:col-span-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sale-method">Método de Financiamiento *</Label>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsAddingMethod(true)}
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Nuevo método
                          </Button>
                        </div>
                        <Select 
                          value={saleDraft.financingMethodId ? String(saleDraft.financingMethodId) : ''} 
                          onValueChange={(v) => setSaleDraft((prev) => ({ ...prev, financingMethodId: Number(v) }))}
                        >
                          <SelectTrigger id="sale-method">
                            <SelectValue placeholder="Seleccionar método" />
                          </SelectTrigger>
                          <SelectContent>
                            {financingMethods.map((m) => (
                              <SelectItem key={m.id} value={String(m.id)}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{m.name}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {m.installments} cuotas · {(m.interestRate * 100).toFixed(2)}% interés
                                  </span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {saleDraft.financingMethodId && (() => {
                          const selectedMethod = financingMethods.find(m => m.id === saleDraft.financingMethodId)
                          return selectedMethod ? (
                            <div className="text-sm p-2 bg-muted rounded-md">
                              <div className="font-medium">{selectedMethod.name}</div>
                              <div className="text-muted-foreground">
                                {selectedMethod.installments} cuotas · {(selectedMethod.interestRate * 100).toFixed(2)}% interés
                              </div>
                              {selectedMethod.description && (
                                <div className="text-xs text-muted-foreground mt-1">{selectedMethod.description}</div>
                              )}
                            </div>
                          ) : null
                        })()}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Productos - Card */}
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Productos</CardTitle>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setSaleDraft((prev) => ({ 
                          ...prev, 
                          items: [...prev.items, { 
                            productId: products[0]?.id ?? 0, 
                            quantity: 1, 
                            unitPrice: Number(products[0]?.price || 0) 
                          }] 
                        }))}
                        disabled={products.length === 0}
                      >
                        <Plus className="w-4 h-4 mr-2" /> Agregar producto
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {saleDraft.items.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No hay productos agregados. Click en "Agregar producto" para comenzar.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {/* Headers */}
                        <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground px-1">
                          <div className="col-span-5">Producto</div>
                          <div className="col-span-2 text-center">Cantidad</div>
                          <div className="col-span-2 text-center">Precio Unit.</div>
                          <div className="col-span-2 text-right">Subtotal</div>
                          <div className="col-span-1"></div>
                        </div>
                        
                        {/* Items */}
                        {saleDraft.items.map((it, idx) => (
                          <div key={idx} className="grid grid-cols-12 gap-2 items-center p-2 border rounded-lg hover:bg-muted/50 transition-colors">
                            {/* Producto Select */}
                            <div className="col-span-5">
                              <Select 
                                value={String(it.productId)} 
                                onValueChange={(v) => setSaleDraft((prev) => ({ 
                                  ...prev, 
                                  items: prev.items.map((x, i) => i === idx ? { 
                                    ...x, 
                                    productId: Number(v), 
                                    unitPrice: Number(products.find(p => p.id === Number(v))?.price || 0) 
                                  } : x) 
                                }))}
                              >
                                <SelectTrigger className="h-9">
                                  <SelectValue placeholder="Producto" />
                                </SelectTrigger>
                                <SelectContent>
                                  {products.map((p) => (
                                    <SelectItem key={p.id} value={String(p.id)}>
                                      <div className="flex flex-col">
                                        <span>{p.name}</span>
                                        <span className="text-xs text-muted-foreground">${typeof p.price === 'number' ? p.price.toFixed(2) : p.price}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            
                            {/* Cantidad */}
                            <div className="col-span-2">
                              <Input 
                                type="number" 
                                min="1" 
                                value={String(it.quantity)} 
                                onChange={(e) => setSaleDraft((prev) => ({ 
                                  ...prev, 
                                  items: prev.items.map((x, i) => i === idx ? { 
                                    ...x, 
                                    quantity: Number(e.target.value) || 1 
                                  } : x) 
                                }))} 
                                className="h-9 text-center"
                              />
                            </div>
                            
                            {/* Precio Unitario */}
                            <div className="col-span-2">
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                value={String(it.unitPrice)} 
                                onChange={(e) => setSaleDraft((prev) => ({ 
                                  ...prev, 
                                  items: prev.items.map((x, i) => i === idx ? { 
                                    ...x, 
                                    unitPrice: Number(e.target.value) || 0 
                                  } : x) 
                                }))} 
                                className="h-9 text-center"
                              />
                            </div>
                            
                            {/* Subtotal */}
                            <div className="col-span-2 text-right font-medium">
                              ${(it.quantity * it.unitPrice).toFixed(2)}
                            </div>
                            
                            {/* Delete Button */}
                            <div className="col-span-1 flex justify-end">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => setSaleDraft((prev) => ({ 
                                  ...prev, 
                                  items: prev.items.filter((_, i) => i !== idx) 
                                }))}
                                className="h-9 w-9 p-0 hover:bg-destructive hover:text-destructive-foreground"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Resumen - Card */}
                <Card className="bg-muted/50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Resumen de la Venta</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const subtotal = saleDraft.items.reduce((a, b) => a + b.unitPrice * b.quantity, 0)
                      const method = financingMethods.find((m) => m.id === saleDraft.financingMethodId)
                      const interest = subtotal * (method?.interestRate || 0)
                      const total = subtotal + interest
                      const installmentAmount = method ? total / method.installments : 0

                      return (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-muted-foreground">Subtotal:</span>
                            <span className="font-medium">${subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between items-center text-lg">
                            <span className="text-muted-foreground">
                              Interés {method ? `(${(method.interestRate * 100).toFixed(2)}%)` : ''}:
                            </span>
                            <span className="font-medium">${interest.toFixed(2)}</span>
                          </div>
                          <div className="border-t pt-3 flex justify-between items-center text-2xl">
                            <span className="font-semibold">Total:</span>
                            <span className="font-bold text-primary">${total.toFixed(2)}</span>
                          </div>
                          {method && (
                            <div className="flex justify-between items-center text-sm pt-2 border-t">
                              <span className="text-muted-foreground">
                                {method.installments} cuotas de:
                              </span>
                              <span className="font-semibold">${installmentAmount.toFixed(2)}</span>
                            </div>
                          )}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => {
                  setIsAddingSale(false)
                  setClientSearchTerm("")
                }}>
                  <X className="w-4 h-4 mr-2" /> Cancelar
                </Button>
                <Button 
                  onClick={async () => {
                    if (!saleDraft.clientId || !saleDraft.financingMethodId || saleDraft.items.length === 0) {
                      toast({ 
                        title: "Error", 
                        description: "Completa todos los campos requeridos y agrega al menos un producto", 
                        variant: "destructive" as any 
                      })
                      return
                    }
                    const body = { 
                      clientId: saleDraft.clientId, 
                      financingMethodId: saleDraft.financingMethodId, 
                      items: saleDraft.items 
                    }
                    const res = await fetch('/api/sales', { 
                      method: 'POST', 
                      headers: { 'Content-Type': 'application/json' }, 
                      body: JSON.stringify(body) 
                    })
                    const ok = await handleApiResponse(res, { success: 'Venta creada exitosamente' })
                    if (ok) {
                      const created = await res!.json()
                      setSales((prev) => [created, ...prev])
                      setIsAddingSale(false)
                      setClientSearchTerm("")
                      setSaleDraft({ items: [] })
                    }
                  }}
                  disabled={!saleDraft.clientId || !saleDraft.financingMethodId || saleDraft.items.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" /> Guardar Venta
                </Button>
              </div>
            </DialogContent>
          </Dialog>

      </Tabs>
    </div>
  )
}
