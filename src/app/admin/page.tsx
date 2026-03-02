'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Package,
  Mail,
  Users,
  FileText,
  LogOut,
  Plus,
  Pencil,
  Trash2,
  Eye,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  BarChart3,
  PieChart,
  X,
  Upload,
  Image as ImageIcon,
  RefreshCw,
} from 'lucide-react'

// ============================================
// Types
// ============================================
interface DashboardStats {
  summary: {
    products: { total: number; inStock: number; outOfStock: number }
    orders: { total: number; pending: number; completed: number }
    revenue: { total: number; monthly: number; daily: number; growth: number }
    users: { total: number; newThisMonth: number }
    messages: { total: number; new: number }
    quotes: { total: number; pending: number }
    newsletter: number
  }
  lowStockProducts: LowStockProduct[]
  recentOrders: RecentOrder[]
  topProducts: TopProduct[]
  charts: {
    revenueByDay: { date: string; revenue: number; orders: number }[]
    ordersByStatus: { status: string; count: number }[]
    productsByCategory: { category: string; count: number }[]
  }
}

interface LowStockProduct {
  id: string
  name: string
  stock: number
  category: string
  image: string | null
}

interface RecentOrder {
  id: string
  orderNumber: string
  billingName: string
  total: number
  status: string
  createdAt: string
  items: { productName: string; quantity: number; price: number }[]
}

interface TopProduct {
  productId: string | null
  name: string
  totalSold: number
}

interface Contact {
  id: string
  name: string
  email: string
  phone: string | null
  subject: string | null
  message: string
  status: string
  createdAt: string
}

interface Newsletter {
  id: string
  email: string
  name: string | null
  active: boolean
  source: string | null
  createdAt: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice: number | null
  currency: string
  category: string
  image: string | null
  images: string | null
  features: string | null
  inStock: boolean
  stock: number
  featured: boolean
  order: number
  createdAt: string
}

interface QuoteRequest {
  id: string
  name: string
  email: string
  phone: string | null
  productType: string | null
  message: string
  status: string
  createdAt: string
}

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

interface Order {
  id: string
  orderNumber: string
  billingName: string
  billingEmail: string
  billingPhone: string
  total: number
  subtotal: number
  discount: number
  status: string
  paymentStatus: string
  createdAt: string
  items: { productName: string; quantity: number; price: number }[]
}

// ============================================
// Admin Panel Component
// ============================================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('adminAuth') === 'true'
  })
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const [activeTab, setActiveTab] = useState('dashboard')
  
  // Dashboard stats
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  
  // Data states
  const [contacts, setContacts] = useState<Contact[]>([])
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [quotes, setQuotes] = useState<QuoteRequest[]>([])
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Product form states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: '',
    comparePrice: '',
    currency: 'TRY',
    category: 'perdeler',
    image: '',
    images: [] as string[],
    features: [] as string[],
    inStock: true,
    stock: '0',
    featured: false,
  })
  const [newFeature, setNewFeature] = useState('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [productToDelete, setProductToDelete] = useState<Product | null>(null)

  // FAQ form states
  const [faqDialogOpen, setFaqDialogOpen] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [faqForm, setFaqForm] = useState({
    question: '',
    answer: '',
    category: 'genel',
    order: 0,
    active: true,
  })
  const [faqDeleteDialogOpen, setFaqDeleteDialogOpen] = useState(false)
  const [faqToDelete, setFaqToDelete] = useState<FAQ | null>(null)

  // Upload states
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  // View message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Contact | QuoteRequest | null>(null)
  const [messageType, setMessageType] = useState<'contact' | 'quote'>('contact')

  // View order dialog
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const hasFetchedRef = useRef(false)
  const ADMIN_PASSWORD = 'oztelevi2024'

  // Fetch Dashboard Stats
  const fetchDashboardStats = useCallback(async () => {
    setStatsLoading(true)
    try {
      const res = await fetch('/api/admin/stats')
      const data = await res.json()
      if (data.success) {
        setDashboardStats(data.data)
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error)
    }
    setStatsLoading(false)
  }, [])

  // Fetch functions
  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch('/api/contact?limit=100')
      const data = await res.json()
      if (data.success) setContacts(data.data)
    } catch (error) {
      console.error('Error fetching contacts:', error)
    }
  }, [])

  const fetchNewsletters = useCallback(async () => {
    try {
      const res = await fetch('/api/newsletter?limit=100')
      const data = await res.json()
      if (data.success) setNewsletters(data.data)
    } catch (error) {
      console.error('Error fetching newsletters:', error)
    }
  }, [])

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?limit=100')
      const data = await res.json()
      if (data.success) setProducts(data.data)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }, [])

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch('/api/quote?limit=100')
      const data = await res.json()
      if (data.success) setQuotes(data.data)
    } catch (error) {
      console.error('Error fetching quotes:', error)
    }
  }, [])

  const fetchFAQs = useCallback(async () => {
    try {
      const res = await fetch('/api/faq?active=all')
      const data = await res.json()
      if (data.success) setFaqs(data.data)
    } catch (error) {
      console.error('Error fetching FAQs:', error)
    }
  }, [])

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders?limit=100')
      const data = await res.json()
      if (data.success) setOrders(data.data)
    } catch (error) {
      console.error('Error fetching orders:', error)
    }
  }, [])

  const fetchAllData = useCallback(async () => {
    setIsLoading(true)
    await Promise.all([
      fetchDashboardStats(),
      fetchContacts(),
      fetchNewsletters(),
      fetchProducts(),
      fetchQuotes(),
      fetchFAQs(),
      fetchOrders(),
    ])
    setIsLoading(false)
  }, [fetchDashboardStats, fetchContacts, fetchNewsletters, fetchProducts, fetchQuotes, fetchFAQs, fetchOrders])

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchAllData()
    }
  }, [isAuthenticated, fetchAllData])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true)
      sessionStorage.setItem('adminAuth', 'true')
      setLoginError('')
    } else {
      setLoginError('Yanlış şifre. Lütfen tekrar deneyiniz.')
    }
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    sessionStorage.removeItem('adminAuth')
    hasFetchedRef.current = false
  }

  // Product CRUD operations
  const handleCreateProduct = async () => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...productForm,
          images: productForm.images.length > 0 ? productForm.images : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProductDialogOpen(false)
        resetProductForm()
        fetchProducts()
        fetchDashboardStats()
      } else {
        alert(data.error || 'Ürün eklenirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Ürün eklenirken bir hata oluştu.')
    }
  }

  const handleUpdateProduct = async () => {
    if (!editingProduct) return
    try {
      const res = await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingProduct.id,
          ...productForm,
          images: productForm.images.length > 0 ? productForm.images : null,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setProductDialogOpen(false)
        resetProductForm()
        fetchProducts()
        fetchDashboardStats()
      } else {
        alert(data.error || 'Ürün güncellenirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error updating product:', error)
      alert('Ürün güncellenirken bir hata oluştu.')
    }
  }

  const handleDeleteProduct = async () => {
    if (!productToDelete) return
    try {
      const res = await fetch(`/api/products?id=${productToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setDeleteDialogOpen(false)
        setProductToDelete(null)
        fetchProducts()
        fetchDashboardStats()
      } else {
        alert(data.error || 'Ürün silinirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Ürün silinirken bir hata oluştu.')
    }
  }

  const openEditProduct = (product: Product) => {
    setEditingProduct(product)
    let parsedFeatures: string[] = []
    let parsedImages: string[] = []
    try {
      parsedFeatures = product.features ? JSON.parse(product.features) : []
      parsedImages = product.images ? JSON.parse(product.images) : []
    } catch {
      parsedFeatures = []
      parsedImages = []
    }
    setProductForm({
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price.toString(),
      comparePrice: product.comparePrice?.toString() || '',
      currency: product.currency,
      category: product.category,
      image: product.image || '',
      images: parsedImages,
      features: parsedFeatures,
      inStock: product.inStock,
      stock: product.stock.toString(),
      featured: product.featured,
    })
    setProductDialogOpen(true)
  }

  const resetProductForm = () => {
    setProductForm({
      name: '',
      slug: '',
      description: '',
      price: '',
      comparePrice: '',
      currency: 'TRY',
      category: 'perdeler',
      image: '',
      images: [],
      features: [],
      inStock: true,
      stock: '0',
      featured: false,
    })
    setNewFeature('')
    setEditingProduct(null)
  }

  // FAQ CRUD operations
  const handleCreateFaq = async () => {
    try {
      const res = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqForm),
      })
      const data = await res.json()
      if (data.success) {
        setFaqDialogOpen(false)
        resetFaqForm()
        fetchFAQs()
      } else {
        alert(data.error || 'SSS eklenirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error creating FAQ:', error)
      alert('SSS eklenirken bir hata oluştu.')
    }
  }

  const handleUpdateFaq = async () => {
    if (!editingFaq) return
    try {
      const res = await fetch('/api/faq', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingFaq.id, ...faqForm }),
      })
      const data = await res.json()
      if (data.success) {
        setFaqDialogOpen(false)
        resetFaqForm()
        fetchFAQs()
      } else {
        alert(data.error || 'SSS güncellenirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error updating FAQ:', error)
      alert('SSS güncellenirken bir hata oluştu.')
    }
  }

  const handleDeleteFaq = async () => {
    if (!faqToDelete) return
    try {
      const res = await fetch(`/api/faq?id=${faqToDelete.id}`, { method: 'DELETE' })
      const data = await res.json()
      if (data.success) {
        setFaqDeleteDialogOpen(false)
        setFaqToDelete(null)
        fetchFAQs()
      } else {
        alert(data.error || 'SSS silinirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error)
      alert('SSS silinirken bir hata oluştu.')
    }
  }

  const openEditFaq = (faq: FAQ) => {
    setEditingFaq(faq)
    setFaqForm({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      active: faq.active,
    })
    setFaqDialogOpen(true)
  }

  const resetFaqForm = () => {
    setFaqForm({ question: '', answer: '', category: 'genel', order: 0, active: true })
    setEditingFaq(null)
  }

  const addFeature = () => {
    if (newFeature.trim()) {
      setProductForm((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }))
      setNewFeature('')
    }
  }

  const removeFeature = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
      .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
      .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMultiple = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError('')
    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const formData = new FormData()
        formData.append('file', file)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (data.success) {
          uploadedUrls.push(data.url)
        } else {
          throw new Error(data.error || 'Yükleme hatası')
        }
      }

      if (isMultiple) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }))
      } else {
        setProductForm((prev) => ({ ...prev, image: uploadedUrls[0] }))
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError('Dosya yüklenirken bir hata oluştu.')
    } finally {
      setIsUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setProductForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  const handleOrderStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status }),
      })
      const data = await res.json()
      if (data.success) {
        fetchOrders()
        fetchDashboardStats()
      } else {
        alert(data.error || 'Sipariş güncellenirken bir hata oluştu.')
      }
    } catch (error) {
      console.error('Error updating order:', error)
      alert('Sipariş güncellenirken bir hata oluştu.')
    }
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      new: { label: 'Yeni', variant: 'default' },
      read: { label: 'Okundu', variant: 'secondary' },
      replied: { label: 'Yanıtlandı', variant: 'outline' },
      archived: { label: 'Arşivlendi', variant: 'secondary' },
      pending: { label: 'Bekliyor', variant: 'default' },
      confirmed: { label: 'Onaylandı', variant: 'default' },
      processing: { label: 'Hazırlanıyor', variant: 'secondary' },
      shipped: { label: 'Kargoda', variant: 'outline' },
      delivered: { label: 'Teslim Edildi', variant: 'outline' },
      cancelled: { label: 'İptal', variant: 'destructive' },
    }
    const s = statusMap[status] || { label: status, variant: 'outline' }
    return <Badge variant={s.variant}>{s.label}</Badge>
  }

  const getCategoryBadge = (category: string) => {
    const categoryMap: Record<string, string> = {
      perdeler: 'Perdeler', tekstiller: 'Tekstiller',
      'yatak-odasi': 'Yatak Odası', aksesuarlar: 'Aksesuarlar',
      genel: 'Genel', urunler: 'Ürünler', siparis: 'Sipariş',
      teslimat: 'Teslimat', iade: 'İade',
    }
    return <Badge variant="outline">{categoryMap[category] || category}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
  }

  // ============================================
  // Login Screen
  // ============================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-light">
              ÖzTelevi <span className="font-normal italic">Admin</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Admin şifresini giriniz"
                  required
                />
              </div>
              {loginError && <p className="text-sm text-red-500">{loginError}</p>}
              <Button type="submit" className="w-full">Giriş Yap</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ============================================
  // Dashboard
  // ============================================
  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 p-4 flex flex-col">
        <div className="mb-8">
          <h1 className="text-xl font-light">
            ÖzTelevi <span className="font-normal italic">Admin</span>
          </h1>
        </div>

        <nav className="flex-1 space-y-1">
          <button onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'dashboard' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <BarChart3 className="w-4 h-4" />
            Dashboard
          </button>
          <button onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'products' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <Package className="w-4 h-4" />
            Ürünler
          </button>
          <button onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'orders' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <ShoppingCart className="w-4 h-4" />
            Siparişler
          </button>
          <button onClick={() => setActiveTab('contacts')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'contacts' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <Mail className="w-4 h-4" />
            İletişim
          </button>
          <button onClick={() => setActiveTab('quotes')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'quotes' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <FileText className="w-4 h-4" />
            Teklifler
          </button>
          <button onClick={() => setActiveTab('newsletters')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'newsletters' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <Users className="w-4 h-4" />
            Bülten
          </button>
          <button onClick={() => setActiveTab('faqs')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'faqs' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <HelpCircle className="w-4 h-4" />
            SSS
          </button>
        </nav>

        <div className="border-t border-stone-200 pt-4">
          <Button onClick={handleLogout} variant="ghost" className="w-full justify-start text-stone-600 hover:text-stone-900">
            <LogOut className="w-4 h-4 mr-3" />
            Çıkış Yap
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <DollarSign className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Toplam Gelir</p>
                      <p className="text-2xl font-semibold">
                        {formatCurrency(dashboardStats?.summary.revenue.total || 0)}
                      </p>
                      <div className="flex items-center gap-1 text-xs">
                        {(dashboardStats?.summary.revenue.growth || 0) >= 0 ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        )}
                        <span className={dashboardStats?.summary.revenue.growth && dashboardStats.summary.revenue.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {Math.abs(dashboardStats?.summary.revenue.growth || 0).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <ShoppingCart className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Toplam Sipariş</p>
                      <p className="text-2xl font-semibold">{dashboardStats?.summary.orders.total || 0}</p>
                      <p className="text-xs text-stone-400">
                        {dashboardStats?.summary.orders.pending || 0} bekleyen
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <Package className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Toplam Ürün</p>
                      <p className="text-2xl font-semibold">{dashboardStats?.summary.products.total || 0}</p>
                      <p className="text-xs text-stone-400">
                        {dashboardStats?.summary.products.inStock || 0} stokta
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <Users className="w-6 h-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-sm text-stone-500">Toplam Kullanıcı</p>
                      <p className="text-2xl font-semibold">{dashboardStats?.summary.users.total || 0}</p>
                      <p className="text-xs text-stone-400">
                        {dashboardStats?.summary.users.newThisMonth || 0} bu ay
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Son 7 Günlük Gelir
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.charts.revenueByDay ? (
                    <div className="h-64 flex items-end gap-2">
                      {dashboardStats.charts.revenueByDay.map((day, index) => {
                        const maxRevenue = Math.max(...dashboardStats.charts.revenueByDay.map(d => d.revenue))
                        const height = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2">
                            <div className="w-full bg-stone-100 rounded-t-sm relative" style={{ height: '200px' }}>
                              <div
                                className="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-sm transition-all"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                            <span className="text-xs text-stone-500">
                              {new Date(day.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                            </span>
                            <span className="text-xs font-medium">{formatCurrency(day.revenue)}</span>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-stone-400">
                      Veri yok
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Order Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <PieChart className="w-5 h-5" />
                    Sipariş Durumları
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.charts.ordersByStatus && dashboardStats.charts.ordersByStatus.length > 0 ? (
                    <div className="space-y-4">
                      {dashboardStats.charts.ordersByStatus.map((status, index) => {
                        const total = dashboardStats.charts.ordersByStatus.reduce((acc, s) => acc + s.count, 0)
                        const percentage = total > 0 ? (status.count / total) * 100 : 0
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-amber-500', 'bg-purple-500', 'bg-red-500']
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="capitalize">{status.status}</span>
                              <span className="text-stone-500">{status.count} ({percentage.toFixed(1)}%)</span>
                            </div>
                            <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${colors[index % colors.length]} rounded-full transition-all`}
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center text-stone-400">
                      Henüz sipariş yok
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Low Stock Alert */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-medium flex items-center gap-2 text-amber-600">
                    <AlertTriangle className="w-5 h-5" />
                    Düşük Stok Uyarısı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.lowStockProducts && dashboardStats.lowStockProducts.length > 0 ? (
                    <div className="space-y-3">
                      {dashboardStats.lowStockProducts.map((product) => (
                        <div key={product.id} className="flex items-center gap-3 p-2 bg-amber-50 rounded-lg">
                          {product.image ? (
                            <div className="relative w-10 h-10 rounded overflow-hidden">
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-stone-100 rounded flex items-center justify-center">
                              <Package className="w-5 h-5 text-stone-400" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{product.name}</p>
                            <p className="text-xs text-amber-600">
                              {product.stock === 0 ? 'Tükendi!' : `${product.stock} adet kaldı`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-stone-400">
                      <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Tüm ürünler yeterli stokta</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Orders */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-medium">Son Siparişler</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab('orders')}>
                    Tümünü Gör
                  </Button>
                </CardHeader>
                <CardContent>
                  {dashboardStats?.recentOrders && dashboardStats.recentOrders.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Sipariş No</TableHead>
                          <TableHead>Müşteri</TableHead>
                          <TableHead>Tutar</TableHead>
                          <TableHead>Durum</TableHead>
                          <TableHead>Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dashboardStats.recentOrders.slice(0, 5).map((order) => (
                          <TableRow key={order.id}>
                            <TableCell className="font-medium">{order.orderNumber}</TableCell>
                            <TableCell>{order.billingName}</TableCell>
                            <TableCell>{formatCurrency(order.total)}</TableCell>
                            <TableCell>{getStatusBadge(order.status)}</TableCell>
                            <TableCell className="text-sm text-stone-500">{formatDate(order.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="py-8 text-center text-stone-400">
                      <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Henüz sipariş yok</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Ürünler</h2>
                <Button onClick={() => { resetProductForm(); setProductDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni Ürün
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Görsel</TableHead>
                    <TableHead>Ürün Adı</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Fiyat</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Öne Çıkan</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-stone-500 py-8">
                        Henüz ürün bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    products.map((product) => (
                      <TableRow key={product.id}>
                        <TableCell>
                          {product.image ? (
                            <div className="relative w-12 h-12 rounded overflow-hidden">
                              <Image src={product.image} alt={product.name} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-stone-100 rounded flex items-center justify-center">
                              <ImageIcon className="w-5 h-5 text-stone-400" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{getCategoryBadge(product.category)}</TableCell>
                        <TableCell>
                          <div>
                            {formatCurrency(product.price)}
                            {product.comparePrice && (
                              <span className="block text-xs text-stone-400 line-through">
                                {formatCurrency(product.comparePrice)}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className={product.stock === 0 ? 'text-red-500' : product.stock < 10 ? 'text-amber-500' : ''}>
                              {product.stock}
                            </span>
                            {product.stock === 0 && (
                              <Badge variant="destructive" className="text-xs">Tükendi</Badge>
                            )}
                            {product.stock > 0 && product.stock < 10 && (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {product.featured && <Badge variant="outline">Öne Çıkan</Badge>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditProduct(product)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                              onClick={() => { setProductToDelete(product); setDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Siparişler</h2>
                <Button variant="outline" size="sm" onClick={() => fetchOrders()}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Yenile
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sipariş No</TableHead>
                    <TableHead>Müşteri</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Ödeme</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center text-stone-500 py-8">
                        Henüz sipariş bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.orderNumber}</TableCell>
                        <TableCell>{order.billingName}</TableCell>
                        <TableCell className="text-sm">{order.billingEmail}</TableCell>
                        <TableCell>{formatCurrency(order.total)}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getStatusBadge(order.paymentStatus)}</TableCell>
                        <TableCell className="text-sm text-stone-500">{formatDate(order.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm"
                              onClick={() => { setSelectedOrder(order); setOrderDialogOpen(true); }}>
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Select onValueChange={(value) => handleOrderStatusUpdate(order.id, value)}>
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue placeholder="Durum" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Bekliyor</SelectItem>
                                <SelectItem value="confirmed">Onaylandı</SelectItem>
                                <SelectItem value="processing">Hazırlanıyor</SelectItem>
                                <SelectItem value="shipped">Kargoda</SelectItem>
                                <SelectItem value="delivered">Teslim Edildi</SelectItem>
                                <SelectItem value="cancelled">İptal</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">İletişim Mesajları</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Konu</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-stone-500 py-8">
                        Henüz mesaj bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.subject || '-'}</TableCell>
                        <TableCell>{getStatusBadge(contact.status)}</TableCell>
                        <TableCell>{formatDate(contact.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm"
                            onClick={() => { setSelectedMessage(contact); setMessageType('contact'); setMessageDialogOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Quotes Tab */}
        {activeTab === 'quotes' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Teklif Talepleri</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ad</TableHead>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Ürün Türü</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quotes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-stone-500 py-8">
                        Henüz teklif talebi bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    quotes.map((quote) => (
                      <TableRow key={quote.id}>
                        <TableCell className="font-medium">{quote.name}</TableCell>
                        <TableCell>{quote.email}</TableCell>
                        <TableCell>{quote.phone || '-'}</TableCell>
                        <TableCell>{quote.productType || '-'}</TableCell>
                        <TableCell>{getStatusBadge(quote.status)}</TableCell>
                        <TableCell>{formatDate(quote.createdAt)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm"
                            onClick={() => { setSelectedMessage(quote); setMessageType('quote'); setMessageDialogOpen(true); }}>
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Newsletters Tab */}
        {activeTab === 'newsletters' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Bülten Aboneleri ({newsletters.length})</h2>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>E-posta</TableHead>
                    <TableHead>Ad</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead>Tarih</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newsletters.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-stone-500 py-8">
                        Henüz abone bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    newsletters.map((newsletter) => (
                      <TableRow key={newsletter.id}>
                        <TableCell className="font-medium">{newsletter.email}</TableCell>
                        <TableCell>{newsletter.name || '-'}</TableCell>
                        <TableCell>{newsletter.source || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={newsletter.active ? 'default' : 'secondary'}>
                            {newsletter.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(newsletter.createdAt)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* FAQs Tab */}
        {activeTab === 'faqs' && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Sıkça Sorulan Sorular</h2>
                <Button onClick={() => { resetFaqForm(); setFaqDialogOpen(true); }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Yeni SSS
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sıra</TableHead>
                    <TableHead>Soru</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faqs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-stone-500 py-8">
                        Henüz SSS bulunmuyor.
                      </TableCell>
                    </TableRow>
                  ) : (
                    faqs.map((faq) => (
                      <TableRow key={faq.id}>
                        <TableCell>{faq.order}</TableCell>
                        <TableCell className="font-medium max-w-xs truncate">{faq.question}</TableCell>
                        <TableCell>{getCategoryBadge(faq.category)}</TableCell>
                        <TableCell>
                          <Badge variant={faq.active ? 'default' : 'secondary'}>
                            {faq.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => openEditFaq(faq)}>
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700"
                              onClick={() => { setFaqToDelete(faq); setFaqDeleteDialogOpen(true); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </main>

      {/* Product Dialog */}
      <Dialog open={productDialogOpen} onOpenChange={setProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
            <DialogDescription>
              Ürün bilgilerini girin. * ile işaretli alanlar zorunludur.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ürün Adı *</Label>
                <Input
                  id="name"
                  value={productForm.name}
                  onChange={(e) => {
                    setProductForm((prev) => ({ ...prev, name: e.target.value }))
                    if (!editingProduct) {
                      setProductForm((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))
                    }
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={productForm.slug}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                value={productForm.description}
                onChange={(e) => setProductForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={4}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Fiyat *</Label>
                <Input
                  id="price"
                  type="number"
                  value={productForm.price}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, price: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="comparePrice">Karşılaştırma Fiyatı</Label>
                <Input
                  id="comparePrice"
                  type="number"
                  value={productForm.comparePrice}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, comparePrice: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stok Miktarı</Label>
                <Input
                  id="stock"
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, stock: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Kategori</Label>
                <Select
                  value={productForm.category}
                  onValueChange={(value) => setProductForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="perdeler">Perdeler</SelectItem>
                    <SelectItem value="tekstiller">Tekstiller</SelectItem>
                    <SelectItem value="yatak-odasi">Yatak Odası</SelectItem>
                    <SelectItem value="aksesuarlar">Aksesuarlar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Para Birimi</Label>
                <Select
                  value={productForm.currency}
                  onValueChange={(value) => setProductForm((prev) => ({ ...prev, currency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRY">TRY - Türk Lirası</SelectItem>
                    <SelectItem value="USD">USD - Dolar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Main Image Upload */}
            <div className="space-y-2">
              <Label>Ana Görsel</Label>
              <div className="flex gap-4">
                {productForm.image ? (
                  <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <Image src={productForm.image} alt="Main" fill className="object-cover" />
                    <button
                      onClick={() => setProductForm((prev) => ({ ...prev, image: '' }))}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
                    <Upload className="w-6 h-6 text-stone-400" />
                    <span className="text-xs text-stone-400 mt-1">Yükle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, false)}
                      disabled={isUploading}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Multiple Images Upload */}
            <div className="space-y-2">
              <Label>Ek Görseller</Label>
              <div className="flex flex-wrap gap-3">
                {productForm.images.map((img, index) => (
                  <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                    <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
                  <Plus className="w-5 h-5 text-stone-400" />
                  <span className="text-xs text-stone-400 mt-1">Ekle</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, true)}
                    disabled={isUploading}
                  />
                </label>
              </div>
              {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
            </div>

            {/* Features */}
            <div className="space-y-2">
              <Label>Özellikler</Label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  placeholder="Yeni özellik ekle..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <Button type="button" variant="outline" onClick={addFeature}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {productForm.features.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {productForm.features.map((feature, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {feature}
                      <button onClick={() => removeFeature(index)} className="ml-1 hover:text-red-500">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Checkboxes */}
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.inStock}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, inStock: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">Stokta</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) => setProductForm((prev) => ({ ...prev, featured: e.target.checked }))}
                  className="w-4 h-4"
                />
                <span className="text-sm">Öne Çıkan</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialogOpen(false)}>İptal</Button>
            <Button onClick={editingProduct ? handleUpdateProduct : handleCreateProduct} disabled={isUploading}>
              {isUploading ? 'Yükleniyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Product Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ürünü Sil</DialogTitle>
            <DialogDescription>
              &quot;{productToDelete?.name}&quot; ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleDeleteProduct}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FAQ Dialog */}
      <Dialog open={faqDialogOpen} onOpenChange={setFaqDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingFaq ? 'SSS Düzenle' : 'Yeni SSS Ekle'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Soru *</Label>
              <Input
                value={faqForm.question}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, question: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Cevap *</Label>
              <Textarea
                value={faqForm.answer}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, answer: e.target.value }))}
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={faqForm.category} onValueChange={(value) => setFaqForm((prev) => ({ ...prev, category: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="genel">Genel</SelectItem>
                    <SelectItem value="urunler">Ürünler</SelectItem>
                    <SelectItem value="siparis">Sipariş</SelectItem>
                    <SelectItem value="teslimat">Teslimat</SelectItem>
                    <SelectItem value="iade">İade</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sıra</Label>
                <Input
                  type="number"
                  value={faqForm.order}
                  onChange={(e) => setFaqForm((prev) => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={faqForm.active}
                onChange={(e) => setFaqForm((prev) => ({ ...prev, active: e.target.checked }))}
                className="w-4 h-4"
              />
              <span className="text-sm">Aktif</span>
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqDialogOpen(false)}>İptal</Button>
            <Button onClick={editingFaq ? handleUpdateFaq : handleCreateFaq}>
              {editingFaq ? 'Güncelle' : 'Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete FAQ Dialog */}
      <Dialog open={faqDeleteDialogOpen} onOpenChange={setFaqDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>SSS Sil</DialogTitle>
            <DialogDescription>
              Bu SSS&apos;yi silmek istediğinizden emin misiniz?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFaqDeleteDialogOpen(false)}>İptal</Button>
            <Button variant="destructive" onClick={handleDeleteFaq}>Sil</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Message View Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {messageType === 'contact' ? 'Mesaj Detayı' : 'Teklif Talebi Detayı'}
            </DialogTitle>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-stone-500">Ad</p>
                  <p className="font-medium">{selectedMessage.name}</p>
                </div>
                <div>
                  <p className="text-sm text-stone-500">E-posta</p>
                  <p className="font-medium">{selectedMessage.email}</p>
                </div>
              </div>
              {'phone' in selectedMessage && selectedMessage.phone && (
                <div>
                  <p className="text-sm text-stone-500">Telefon</p>
                  <p className="font-medium">{selectedMessage.phone}</p>
                </div>
              )}
              {messageType === 'contact' && 'subject' in selectedMessage && selectedMessage.subject && (
                <div>
                  <p className="text-sm text-stone-500">Konu</p>
                  <p className="font-medium">{selectedMessage.subject}</p>
                </div>
              )}
              {messageType === 'quote' && 'productType' in selectedMessage && selectedMessage.productType && (
                <div>
                  <p className="text-sm text-stone-500">İlgilenilen Ürün</p>
                  <p className="font-medium">{selectedMessage.productType}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-stone-500">Mesaj</p>
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
              <div className="text-sm text-stone-400">
                {formatDate(selectedMessage.createdAt)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order View Dialog */}
      <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sipariş Detayı - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-2">Fatura Bilgileri</h4>
                  <div className="text-sm space-y-1 text-stone-600">
                    <p>{selectedOrder.billingName}</p>
                    <p>{selectedOrder.billingEmail}</p>
                    <p>{selectedOrder.billingPhone}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Sipariş Bilgileri</h4>
                  <div className="text-sm space-y-1 text-stone-600">
                    <p>Durum: {getStatusBadge(selectedOrder.status)}</p>
                    <p>Ödeme: {getStatusBadge(selectedOrder.paymentStatus)}</p>
                    <p>Tarih: {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Ürünler</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ürün</TableHead>
                      <TableHead className="text-right">Adet</TableHead>
                      <TableHead className="text-right">Fiyat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam</span>
                  <span>{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span>-{formatCurrency(selectedOrder.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium text-lg">
                  <span>Toplam</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
