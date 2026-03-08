'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import Image from 'next/image'
import { signIn, signOut, useSession } from 'next-auth/react'
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
import MediaLibraryGrid from '@/components/admin/MediaLibraryGrid'
import ProductFormDialog from '@/components/admin/ProductFormDialog'
import type {
  ContentPage,
  MediaAsset,
  PageSection,
  ProductFieldConfig,
  ProductFormState,
} from '@/components/admin/types'
import { MANAGED_PAGE_SLUGS } from '@/lib/content-pages'
import type { PageEditorPreset } from '@/lib/page-editor-presets'
import type { MediaStorageMode } from '@/lib/media-storage'

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

const EMPTY_PAGE_FORM = {
  title: '',
  seoTitle: '',
  seoDescription: '',
  heroTitle: '',
  heroSubtitle: '',
  heroImage: '',
  heroCtaText: '',
  heroCtaLink: '',
  sections: '',
  htmlContent: '',
  schemaJson: '',
}

function withFallback(value: string | null | undefined, fallback = '') {
  if (typeof value !== 'string') return fallback
  return value.trim().length ? value : fallback
}

function parsePageSections(sections: string | null | undefined): PageSection[] {
  if (!sections) return []

  try {
    const parsed = JSON.parse(sections)
    return Array.isArray(parsed) ? parsed as PageSection[] : []
  } catch {
    return []
  }
}

function buildEditorState(page: ContentPage, baseline: PageEditorPreset | null) {
  const currentSections = parsePageSections(page.sections)
  const resolvedSections =
    currentSections.length > 0 && baseline
      ? currentSections.map((section, index) => ({
          ...baseline.sections[index],
          ...section,
          key: section.key || baseline.sections[index]?.key,
        }))
      : currentSections.length > 0
        ? currentSections
        : baseline?.sections || []

  return {
    form: {
      title: withFallback(page.title, baseline?.title || ''),
      seoTitle: withFallback(page.seoTitle, baseline?.seoTitle || ''),
      seoDescription: withFallback(page.seoDescription, baseline?.seoDescription || ''),
      heroTitle: withFallback(page.heroTitle, baseline?.heroTitle || ''),
      heroSubtitle: withFallback(page.heroSubtitle, baseline?.heroSubtitle || ''),
      heroImage: withFallback(page.heroImage, baseline?.heroImage || ''),
      heroCtaText: withFallback(page.heroCtaText, baseline?.heroCtaText || ''),
      heroCtaLink: withFallback(page.heroCtaLink, baseline?.heroCtaLink || ''),
      sections: resolvedSections.length > 0 ? JSON.stringify(resolvedSections) : '',
      htmlContent: withFallback(page.htmlContent, baseline?.htmlContent || ''),
      schemaJson: withFallback(page.schemaJson, baseline?.schemaJson || ''),
    },
    sections: resolvedSections,
  }
}

function getManagedPagePath(slug: string) {
  return MANAGED_PAGE_SLUGS.find((page) => page.slug === slug)?.path || `/${slug}`
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

const PRODUCT_FORM_FIELDS: ProductFieldConfig[] = [
  { key: 'name', label: 'Ürün Adı', type: 'text', required: true, autoSlug: true },
  { key: 'slug', label: 'Slug', type: 'text', required: true },
  { key: 'description', label: 'Açıklama', type: 'textarea', required: true, rows: 4 },
  { key: 'price', label: 'Fiyat', type: 'number', required: true },
  { key: 'comparePrice', label: 'Karşılaştırma Fiyatı', type: 'number' },
  { key: 'stock', label: 'Stok Miktarı', type: 'number' },
  {
    key: 'category',
    label: 'Kategori',
    type: 'select',
    options: [
      { value: 'perdeler', label: 'Perdeler' },
      { value: 'tekstiller', label: 'Tekstiller' },
      { value: 'yatak-odasi', label: 'Yatak Odası' },
      { value: 'aksesuarlar', label: 'Aksesuarlar' },
    ],
  },
  {
    key: 'currency',
    label: 'Para Birimi',
    type: 'select',
    options: [
      { value: 'TRY', label: 'TRY - Türk Lirası' },
      { value: 'USD', label: 'USD - Dolar' },
      { value: 'EUR', label: 'EUR - Euro' },
    ],
  },
  { key: 'inStock', label: 'Stokta', type: 'toggle' },
  { key: 'featured', label: 'Öne Çıkan', type: 'toggle' },
]

// ============================================
// Admin Panel Component
// ============================================
export default function AdminPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated' && session?.user?.role === 'admin'
  const [email, setEmail] = useState('')
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
  const [pages, setPages] = useState<ContentPage[]>([])
  const [selectedPageSlug, setSelectedPageSlug] = useState('anasayfa')
  const [selectedPage, setSelectedPage] = useState<ContentPage | null>(null)
  const [pageBaseline, setPageBaseline] = useState<PageEditorPreset | null>(null)
  const [pageForm, setPageForm] = useState(EMPTY_PAGE_FORM)
  const [pageSections, setPageSections] = useState<PageSection[]>([])
  const [sectionHistory, setSectionHistory] = useState<PageSection[][]>([])
  const [sectionFuture, setSectionFuture] = useState<PageSection[][]>([])
  const [draggingSectionIndex, setDraggingSectionIndex] = useState<number | null>(null)
  const [isAutoSavingPage, setIsAutoSavingPage] = useState(false)
  const [autoSaveMessage, setAutoSaveMessage] = useState('')
  const [isPageDirty, setIsPageDirty] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSavingPage, setIsSavingPage] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Product form states
  const [productDialogOpen, setProductDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [productForm, setProductForm] = useState<ProductFormState>({
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
  const [mediaLibrary, setMediaLibrary] = useState<MediaAsset[]>([])
  const [isMediaLoading, setIsMediaLoading] = useState(false)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaStorageMode, setMediaStorageMode] = useState<MediaStorageMode>('local')
  const [mediaStorageWarning, setMediaStorageWarning] = useState('')

  // View message dialog
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState<Contact | QuoteRequest | null>(null)
  const [messageType, setMessageType] = useState<'contact' | 'quote'>('contact')

  // View order dialog
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const hasFetchedRef = useRef(false)
  const skipNextSectionHistoryRef = useRef(false)
  const lastSavedPageSnapshotRef = useRef('')

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

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/pages')
      const data = await res.json()
      if (data.success) {
        const pageList: ContentPage[] = data.data
        setPages(pageList)

        if (pageList.length > 0 && !pageList.some((page) => page.slug === selectedPageSlug)) {
          setSelectedPageSlug(pageList[0].slug)
        }
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    }
  }, [selectedPageSlug])

  const getPageSnapshot = useCallback(
    (form: typeof pageForm, sections: PageSection[]) =>
      JSON.stringify({
        slug: selectedPageSlug,
        title: form.title,
        seoTitle: form.seoTitle,
        seoDescription: form.seoDescription,
        heroTitle: form.heroTitle,
        heroSubtitle: form.heroSubtitle,
        heroImage: form.heroImage,
        heroCtaText: form.heroCtaText,
        heroCtaLink: form.heroCtaLink,
        htmlContent: form.htmlContent,
        schemaJson: form.schemaJson,
        sections,
      }),
    [selectedPageSlug]
  )

  const setSectionsWithHistory = useCallback(
    (
      next:
        | PageSection[]
        | ((prev: PageSection[]) => PageSection[]),
      options?: { skipHistory?: boolean }
    ) => {
      setPageSections((prev) => {
        const resolved = typeof next === 'function' ? next(prev) : next
        const nextSections = resolved.map((section) => ({ ...section }))

        if (options?.skipHistory) {
          skipNextSectionHistoryRef.current = true
        } else if (JSON.stringify(prev) !== JSON.stringify(nextSections)) {
          setSectionHistory((history) => [...history.slice(-39), prev])
          setSectionFuture([])
        }

        return nextSections
      })
    },
    []
  )

  const fetchMediaLibrary = useCallback(async () => {
    setIsMediaLoading(true)
    try {
      const res = await fetch('/api/upload/library')
      const data = await res.json()
      if (data.success) {
        setMediaLibrary(data.data || [])
        setMediaStorageMode(data.storage === 'cloudinary' ? 'cloudinary' : 'local')
        setMediaStorageWarning(typeof data.warning === 'string' ? data.warning : '')
      }
    } catch (error) {
      console.error('Error fetching media library:', error)
    } finally {
      setIsMediaLoading(false)
    }
  }, [getPageSnapshot, setSectionsWithHistory])

  const handleDeleteMedia = async (asset: MediaAsset) => {
    try {
      const query = new URLSearchParams({
        publicId: asset.publicId,
        url: asset.url,
      })
      const res = await fetch(`/api/upload?${query.toString()}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!data.success) {
        const usageMessage = Array.isArray(data.usedIn) && data.usedIn.length > 0
          ? `\nKullanim alanlari:\n- ${data.usedIn.join('\n- ')}`
          : ''
        alert((data.error || 'Gorsel silinirken bir hata olustu.') + usageMessage)
        return
      }
      setMediaLibrary((prev) => prev.filter((item) => item.publicId !== asset.publicId))
    } catch (error) {
      console.error('Delete media error:', error)
      alert('Gorsel silinirken bir hata olustu.')
    }
  }

  const applyMediaToHero = (url: string) => {
    setPageForm((prev) => ({ ...prev, heroImage: url }))
    setShowMediaLibrary(false)
  }

  const applyBaselineToEditor = useCallback(() => {
    if (!selectedPage || !pageBaseline) return

    const resolvedState = buildEditorState(
      {
        ...selectedPage,
        title: pageBaseline.title,
        seoTitle: pageBaseline.seoTitle,
        seoDescription: pageBaseline.seoDescription,
        heroTitle: pageBaseline.heroTitle,
        heroSubtitle: pageBaseline.heroSubtitle,
        heroImage: pageBaseline.heroImage,
        heroCtaText: pageBaseline.heroCtaText,
        heroCtaLink: pageBaseline.heroCtaLink,
        sections: JSON.stringify(pageBaseline.sections),
        htmlContent: pageBaseline.htmlContent,
        schemaJson: pageBaseline.schemaJson,
      },
      pageBaseline
    )

    setPageForm(resolvedState.form)
    setSectionHistory([])
    setSectionFuture([])
    setSectionsWithHistory(resolvedState.sections, { skipHistory: true })
  }, [pageBaseline, selectedPage, setSectionsWithHistory])

  const applyMediaToProduct = (url: string, mode: 'main' | 'gallery') => {
    if (mode === 'main') {
      setProductForm((prev) => ({ ...prev, image: url }))
    } else {
      setProductForm((prev) => ({
        ...prev,
        images: prev.images.includes(url) ? prev.images : [...prev.images, url],
      }))
    }
  }

  const fetchPageDetail = useCallback(async (slug: string) => {
    try {
      setPageBaseline(null)
      const res = await fetch(`/api/admin/pages/${slug}`)
      const data = await res.json()
      if (data.success) {
        const page: ContentPage = data.data.page
        const baseline: PageEditorPreset | null = data.data.baseline || null
        const resolvedState = buildEditorState(page, baseline)

        setSelectedPage(page)
        setPageBaseline(baseline)
        setPageForm(resolvedState.form)
        setSectionHistory([])
        setSectionFuture([])
        setSectionsWithHistory(resolvedState.sections, { skipHistory: true })
        const snapshot = getPageSnapshot(resolvedState.form, resolvedState.sections)
        lastSavedPageSnapshotRef.current = snapshot
        setIsPageDirty(false)
      }
    } catch (error) {
      console.error('Error fetching page detail:', error)
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
      fetchPages(),
    ])
    setIsLoading(false)
  }, [fetchDashboardStats, fetchContacts, fetchNewsletters, fetchProducts, fetchQuotes, fetchFAQs, fetchOrders, fetchPages])

  useEffect(() => {
    if (isAuthenticated && !hasFetchedRef.current) {
      hasFetchedRef.current = true
      fetchAllData()
    }
  }, [isAuthenticated, fetchAllData])

  useEffect(() => {
    if (!isAuthenticated) {
      hasFetchedRef.current = false
    }
  }, [isAuthenticated])

  useEffect(() => {
    if (isAuthenticated && selectedPageSlug) {
      fetchPageDetail(selectedPageSlug)
    }
  }, [fetchPageDetail, isAuthenticated, selectedPageSlug])

  useEffect(() => {
    if (skipNextSectionHistoryRef.current) {
      skipNextSectionHistoryRef.current = false
    }
  }, [pageSections])

  useEffect(() => {
    if (!isAuthenticated || activeTab !== 'pages' || !selectedPageSlug) return
    const currentSnapshot = getPageSnapshot(pageForm, pageSections)
    setIsPageDirty(currentSnapshot !== lastSavedPageSnapshotRef.current)
  }, [activeTab, getPageSnapshot, isAuthenticated, pageForm, pageSections, selectedPageSlug])

  useEffect(() => {
    if (
      !isAuthenticated ||
      activeTab !== 'pages' ||
      !selectedPageSlug ||
      !isPageDirty ||
      selectedPage?.status === 'published'
    ) {
      return
    }
    const timer = setTimeout(() => {
      void savePage('draft', { silent: true, refreshAfterSave: false })
    }, 1200)
    return () => clearTimeout(timer)
  }, [activeTab, isAuthenticated, isPageDirty, selectedPage?.status, selectedPageSlug])

  useEffect(() => {
    if (isAuthenticated && showMediaLibrary) {
      void fetchMediaLibrary()
    }
  }, [fetchMediaLibrary, isAuthenticated, showMediaLibrary])

  useEffect(() => {
    if (isAuthenticated && productDialogOpen) {
      void fetchMediaLibrary()
    }
  }, [fetchMediaLibrary, isAuthenticated, productDialogOpen])

  const handleUndoSections = () => {
    if (sectionHistory.length === 0) return
    const previous = sectionHistory[sectionHistory.length - 1]
    setSectionHistory((prev) => prev.slice(0, -1))
    setSectionFuture((prev) => [pageSections, ...prev].slice(0, 40))
    setSectionsWithHistory(previous, { skipHistory: true })
  }

  const handleRedoSections = () => {
    if (sectionFuture.length === 0) return
    const next = sectionFuture[0]
    setSectionFuture((prev) => prev.slice(1))
    setSectionHistory((prev) => [...prev.slice(-39), pageSections])
    setSectionsWithHistory(next, { skipHistory: true })
  }

  const moveSection = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const cloned = [...pageSections]
    const [moved] = cloned.splice(fromIndex, 1)
    cloned.splice(toIndex, 0, moved)
    setSectionsWithHistory(cloned)
  }

  const savePage = useCallback(
    async (
      status: 'draft' | 'published',
      options?: { silent?: boolean; refreshAfterSave?: boolean }
    ) => {
      if (!selectedPageSlug) return

      if (options?.silent) {
        setIsAutoSavingPage(true)
      } else {
        setIsSavingPage(true)
      }

      try {
        const sectionsJson = JSON.stringify(pageSections)
        const res = await fetch(`/api/admin/pages/${selectedPageSlug}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...pageForm,
            sections: sectionsJson,
            status,
          }),
        })

        const data = await res.json()
        if (!data.success) {
          if (!options?.silent) {
            alert(data.error || 'Sayfa kaydedilirken bir hata olustu.')
          }
          return
        }

        const currentSnapshot = getPageSnapshot(pageForm, pageSections)
        lastSavedPageSnapshotRef.current = currentSnapshot
        setIsPageDirty(false)
        setSelectedPage((prev) =>
          prev
            ? {
                ...prev,
                ...data.data,
                status,
                updatedAt:
                  typeof data.data?.updatedAt === 'string'
                    ? data.data.updatedAt
                    : prev.updatedAt,
              }
            : prev
        )

        if (options?.silent) {
          setAutoSaveMessage('Otomatik kaydedildi')
          setTimeout(() => setAutoSaveMessage(''), 1800)
        } else {
          await fetchPages()
          if (options?.refreshAfterSave !== false) {
            await fetchPageDetail(selectedPageSlug)
          }
        }
      } catch (error) {
        console.error('Error saving page:', error)
        if (!options?.silent) {
          alert('Sayfa kaydedilirken bir hata olustu.')
        }
      } finally {
        if (options?.silent) {
          setIsAutoSavingPage(false)
        } else {
          setIsSavingPage(false)
        }
      }
    },
    [fetchPageDetail, fetchPages, getPageSnapshot, pageForm, pageSections, selectedPageSlug]
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (result?.ok) {
      setLoginError('')
      setPassword('')
    } else {
      setLoginError('Yanlış şifre. Lütfen tekrar deneyiniz.')
    }
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/giris' })
  }

  const handleSavePage = async (publish: boolean) => {
    await savePage(publish ? 'published' : 'draft', { refreshAfterSave: true })
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

  const updateProductField = (
    key: keyof ProductFormState,
    value: string | boolean
  ) => {
    setProductForm((prev) => ({ ...prev, [key]: value }))
  }

  const uploadMediaAsset = useCallback(
    async (
      file: File,
      options: {
        folder: string
        tags?: string[]
      }
    ) => {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', options.folder)
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','))
      }

      const response = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await response.json()

      if (!data.success || typeof data.url !== 'string') {
        throw new Error(data.error || 'Yukleme hatasi')
      }

      return data.url as string
    },
    []
  )

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMultiple = false) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadError('')
    setIsUploading(true)

    try {
      const uploadedUrls: string[] = []

      for (const file of Array.from(files)) {
        const uploadedUrl = await uploadMediaAsset(file, {
          folder: 'oztelevi/products',
          tags: ['product', productForm.category, isMultiple ? 'gallery' : 'main-image'],
        })
        uploadedUrls.push(uploadedUrl)
      }

      if (isMultiple) {
        setProductForm((prev) => ({
          ...prev,
          images: [...prev.images, ...uploadedUrls],
        }))
      } else {
        setProductForm((prev) => ({ ...prev, image: uploadedUrls[0] }))
      }
      void fetchMediaLibrary()
    } catch (error) {
      console.error('Upload error:', error)
      setUploadError(error instanceof Error ? error.message : 'Dosya yüklenirken bir hata oluştu.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdateMediaTags = async (asset: MediaAsset, tags: string[]) => {
    try {
      const res = await fetch('/api/upload', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          publicId: asset.publicId,
          tags,
        }),
      })
      const data = await res.json()
      if (!data.success) {
        throw new Error(data.error || 'Etiketler guncellenemedi.')
      }
      setMediaLibrary((prev) =>
        prev.map((item) =>
          item.publicId === asset.publicId
            ? { ...item, tags }
            : item
        )
      )
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Etiketler guncellenemedi.')
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
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-10 text-center text-stone-600">Yükleniyor...</CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-stone-100 to-stone-200 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-xl font-medium">Yetkiniz yok</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={handleLogout} className="w-full">
              Çıkış Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oztelevi.com"
                  required
                />
              </div>
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
          <button onClick={() => setActiveTab('pages')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
              activeTab === 'pages' ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'
            }`}>
            <FileText className="w-4 h-4" />
            Sayfa Yonetimi
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

        {activeTab === 'pages' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Yonetilen Sayfalar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {pages.map((page) => (
                    <button
                      key={page.id}
                      onClick={() => setSelectedPageSlug(page.slug)}
                      className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                        selectedPageSlug === page.slug
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-sm">{page.title}</span>
                        <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                          {page.status === 'published' ? 'Yayinda' : 'Taslak'}
                        </Badge>
                      </div>
                      <p className="text-xs opacity-70 mt-1">{getManagedPagePath(page.slug)}</p>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Sayfa Icerigi Duzenle</CardTitle>
                {selectedPage && (
                  <div className="flex flex-wrap items-center gap-3 text-sm text-stone-500">
                    <p>Son guncelleme: {formatDate(selectedPage.updatedAt)}</p>
                    {isAutoSavingPage && <Badge variant="secondary">Otomatik kaydediliyor...</Badge>}
                    {!isAutoSavingPage && autoSaveMessage && (
                      <Badge variant="outline">{autoSaveMessage}</Badge>
                    )}
                    {isPageDirty && <Badge variant="secondary">Kaydedilmemis degisiklik var</Badge>}
                  </div>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {pageBaseline && (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-4 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{pageBaseline.source}</Badge>
                          <span className="text-xs text-stone-500">Canli referans icerik</span>
                        </div>
                        <h3 className="text-base font-medium text-stone-900">
                          {pageBaseline.title || selectedPage?.title || 'Bu sayfa'} icin mevcut referans icerik gorunur durumda
                        </h3>
                        <p className="text-sm text-stone-600">
                          {pageBaseline.description}
                        </p>
                      </div>
                      <Button type="button" variant="outline" onClick={applyBaselineToEditor}>
                        Referansi Editore Aktar
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                      <div className="rounded-lg bg-white/70 p-3 border border-amber-100">
                        <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Hero Baslik</p>
                        <p className="font-medium text-stone-900">{pageBaseline.heroTitle}</p>
                      </div>
                      <div className="rounded-lg bg-white/70 p-3 border border-amber-100">
                        <p className="text-xs uppercase tracking-wide text-stone-500 mb-1">Ana CTA</p>
                        <p className="font-medium text-stone-900">
                          {pageBaseline.heroCtaText} {'->'} {pageBaseline.heroCtaLink}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-wide text-stone-500">Referans bolumler</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {pageBaseline.sections.map((section, index) => (
                          <div
                            key={`${section.type}-${index}`}
                            className="rounded-lg bg-white/70 p-3 border border-amber-100 text-sm"
                          >
                            <p className="font-medium text-stone-900">
                              {index + 1}. {section.title || 'Adsiz Bolum'}
                            </p>
                            <p className="text-stone-500 mt-1 capitalize">{section.type}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Sayfa Basligi</Label>
                  <Input
                    value={pageForm.title}
                    onChange={(e) => setPageForm((prev) => ({ ...prev, title: e.target.value }))}
                    placeholder="Sayfa basligi"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>SEO Baslik</Label>
                    <Input
                      value={pageForm.seoTitle}
                      onChange={(e) => setPageForm((prev) => ({ ...prev, seoTitle: e.target.value }))}
                      placeholder="SEO baslik"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SEO Aciklama</Label>
                    <Input
                      value={pageForm.seoDescription}
                      onChange={(e) => setPageForm((prev) => ({ ...prev, seoDescription: e.target.value }))}
                      placeholder="SEO aciklama"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-medium mb-4">Hero Bölümü</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Hero Başlık</Label>
                      <Input
                        value={pageForm.heroTitle}
                        onChange={(e) => setPageForm((prev) => ({ ...prev, heroTitle: e.target.value }))}
                        placeholder="Ana başlık"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Alt Başlık</Label>
                      <Input
                        value={pageForm.heroSubtitle}
                        onChange={(e) => setPageForm((prev) => ({ ...prev, heroSubtitle: e.target.value }))}
                        placeholder="Alt başlık"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Hero Görseli</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={pageForm.heroImage}
                            onChange={(e) => setPageForm((prev) => ({ ...prev, heroImage: e.target.value }))}
                            placeholder="Görsel URL'si veya yukarıdan yükle"
                          />
                        </div>
                        <label className="cursor-pointer bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-lg flex items-center gap-2 transition">
                          <Upload className="w-4 h-4" />
                          <span className="text-sm">Yükle</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              if (!file) return
                              setIsUploading(true)
                              try {
                                const uploadedUrl = await uploadMediaAsset(file, {
                                  folder: `oztelevi/pages/${selectedPageSlug}`,
                                  tags: ['page', selectedPageSlug, 'hero'],
                                })
                                setPageForm((prev) => ({ ...prev, heroImage: uploadedUrl }))
                              } catch (error) {
                                alert(error instanceof Error ? error.message : 'Yukleme hatasi')
                              } finally {
                                setIsUploading(false)
                              }
                            }}
                            disabled={isUploading}
                          />
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setShowMediaLibrary((prev) => !prev)}
                        >
                          Kutuphane
                        </Button>
                      </div>
                      {pageForm.heroImage && (
                        <div className="mt-2 relative w-32 h-32 rounded-lg overflow-hidden border">
                          <img src={pageForm.heroImage} alt="Önizleme" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <p className="text-xs text-stone-500">Ana sayfanın en üstündeki büyük görsel</p>
                    </div>
                    <div className="space-y-2">
                      <Label>CTA Buton Metni</Label>
                      <Input
                        value={pageForm.heroCtaText}
                        onChange={(e) => setPageForm((prev) => ({ ...prev, heroCtaText: e.target.value }))}
                        placeholder="Tıklayın"
                      />
                    </div>
                  </div>
                  <div className="space-y-2 mt-4">
                    <Label>CTA Buton Link</Label>
                    <Input
                      value={pageForm.heroCtaLink}
                      onChange={(e) => setPageForm((prev) => ({ ...prev, heroCtaLink: e.target.value }))}
                      placeholder="/iletisim"
                    />
                  </div>
                </div>

                {showMediaLibrary && (
                  <div className="border rounded-lg p-4 bg-stone-50">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Medya Kutuphanesi</h4>
                      <Button variant="ghost" size="sm" onClick={() => setShowMediaLibrary(false)}>
                        Kapat
                      </Button>
                    </div>
                    <div className="mb-3 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm">
                      <p className="font-medium text-stone-900">
                        Medya depolama: {mediaStorageMode === 'cloudinary' ? 'Cloudinary' : 'Local fallback'}
                      </p>
                      {mediaStorageWarning && (
                        <p className="mt-1 text-amber-700">{mediaStorageWarning}</p>
                      )}
                    </div>
                    <MediaLibraryGrid
                      title="Gorseller"
                      mediaLibrary={mediaLibrary}
                      isMediaLoading={isMediaLoading}
                      onRefresh={() => void fetchMediaLibrary()}
                      onDelete={handleDeleteMedia}
                      onUpdateTags={handleUpdateMediaTags}
                      onSelectHero={applyMediaToHero}
                    />
                  </div>
                )}

                <div className="border-t pt-4 mt-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Sayfa Bölümleri</h3>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleUndoSections}
                        disabled={sectionHistory.length === 0}
                      >
                        Geri Al
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRedoSections}
                        disabled={sectionFuture.length === 0}
                      >
                        Ileri Al
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setShowPreview(!showPreview)}
                      >
                        {showPreview ? 'Düzenlemeye Dön' : 'Önizleme'}
                      </Button>
                    </div>
                  </div>
                  
                  {showPreview ? (
                    <div className="border rounded-lg p-4 bg-stone-50 max-h-96 overflow-y-auto">
                      <h4 className="font-medium mb-2">Önizleme</h4>
                      {pageForm.heroTitle && (
                        <div className="mb-4 p-3 bg-blue-50 rounded">
                          <strong>Hero Başlık:</strong> {pageForm.heroTitle}
                          {pageForm.heroSubtitle && <div>{pageForm.heroSubtitle}</div>}
                          {pageForm.heroImage && (
                            <img src={pageForm.heroImage} alt="Hero" className="w-32 h-32 object-cover mt-2 rounded" />
                          )}
                        </div>
                      )}
                      {pageSections.map((section, i) => (
                        <div key={i} className="mb-2 p-2 bg-stone-100 rounded text-sm">
                          <strong>{section.type}:</strong> {section.title || section.content?.slice(0, 50)}
                        </div>
                      ))}
                      {!pageForm.heroTitle && pageSections.length === 0 && (
                        <p className="text-stone-500">Henüz içerik eklenmedi</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSection: PageSection = { type: 'text', title: '', content: '' }
                            setSectionsWithHistory([...pageSections, newSection])
                          }}
                        >
                          + Metin
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSection: PageSection = { type: 'image', title: '', image: '' }
                            setSectionsWithHistory([...pageSections, newSection])
                          }}
                        >
                          + Görsel
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSection: PageSection = { type: 'cta', title: '', content: '', link: '', linkText: 'Tıklayın' }
                            setSectionsWithHistory([...pageSections, newSection])
                          }}
                        >
                          + CTA
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSection: PageSection = { type: 'features', title: '', items: ['', '', ''] }
                            setSectionsWithHistory([...pageSections, newSection])
                          }}
                        >
                          + Özellikler
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            const newSection: PageSection = { type: 'gallery', title: '', items: [] }
                            setSectionsWithHistory([...pageSections, newSection])
                          }}
                        >
                          + Galeri
                        </Button>
                      </div>

                      <div className="space-y-4">
                        {pageSections.map((section, index) => (
                          <div
                            key={index}
                            className="border rounded-lg p-4 bg-stone-50"
                            draggable
                            onDragStart={() => setDraggingSectionIndex(index)}
                            onDragOver={(event) => event.preventDefault()}
                            onDrop={() => {
                              if (draggingSectionIndex === null) return
                              moveSection(draggingSectionIndex, index)
                              setDraggingSectionIndex(null)
                            }}
                          >
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-medium capitalize">{section.type} Bölümü</span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={index === 0}
                                  onClick={() => moveSection(index, index - 1)}
                                >
                                  ↑
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={index === pageSections.length - 1}
                                  onClick={() => moveSection(index, index + 1)}
                                >
                                  ↓
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newSections = [...pageSections]
                                    newSections.splice(index, 1)
                                    setSectionsWithHistory(newSections)
                                  }}
                                >
                                  Sil
                                </Button>
                              </div>
                            </div>
                            
                            {section.type === 'text' && (
                              <>
                                <Input
                                  className="mb-2"
                                  placeholder="Başlık"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].title = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <Textarea
                                  placeholder="Metin içeriği"
                                  rows={4}
                                  value={section.content || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].content = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                              </>
                            )}

                            {section.type === 'image' && (
                              <>
                                <Input
                                  className="mb-2"
                                  placeholder="Başlık"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].title = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <div className="flex gap-2">
                                  <Input
                                    placeholder="Görsel URL"
                                    value={section.image || ''}
                                    onChange={(e) => {
                                      const newSections = [...pageSections]
                                      newSections[index].image = e.target.value
                                      setSectionsWithHistory(newSections)
                                    }}
                                  />
                                  <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 px-3 py-2 rounded flex items-center">
                                    <Upload className="w-4 h-4" />
                                    <input
                                      type="file"
                                      accept="image/*"
                                      className="hidden"
                                      onChange={async (e) => {
                                        const file = e.target.files?.[0]
                                        if (!file) return
                                        setIsUploading(true)
                                        try {
                                          const uploadedUrl = await uploadMediaAsset(file, {
                                            folder: `oztelevi/pages/${selectedPageSlug}`,
                                            tags: ['page', selectedPageSlug, 'section-image'],
                                          })
                                          const newSections = [...pageSections]
                                          newSections[index].image = uploadedUrl
                                          setSectionsWithHistory(newSections)
                                        } catch (error) {
                                          alert(error instanceof Error ? error.message : 'Yukleme hatasi')
                                        } finally {
                                          setIsUploading(false)
                                        }
                                      }}
                                      disabled={isUploading}
                                    />
                                  </label>
                                </div>
                                {section.image && (
                                  <img src={section.image} alt="Önizleme" className="w-32 h-32 object-cover mt-2 rounded" />
                                )}
                              </>
                            )}

                            {section.type === 'cta' && (
                              <>
                                <Input
                                  className="mb-2"
                                  placeholder="Başlık"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].title = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <Input
                                  className="mb-2"
                                  placeholder="Açıklama"
                                  value={section.content || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].content = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <div className="grid grid-cols-2 gap-2">
                                  <Input
                                    placeholder="Buton metni"
                                    value={section.linkText || ''}
                                    onChange={(e) => {
                                      const newSections = [...pageSections]
                                      newSections[index].linkText = e.target.value
                                      setSectionsWithHistory(newSections)
                                    }}
                                  />
                                  <Input
                                    placeholder="Link (/iletisim)"
                                    value={section.link || ''}
                                    onChange={(e) => {
                                      const newSections = [...pageSections]
                                      newSections[index].link = e.target.value
                                      setSectionsWithHistory(newSections)
                                    }}
                                  />
                                </div>
                                {section.key === 'contact-cta' && (
                                  <div className="mt-3 space-y-2">
                                    <p className="text-xs font-medium uppercase tracking-[0.2em] text-stone-500">
                                      İletişim Bilgileri
                                    </p>
                                    {['E-posta', 'Telefon', 'Adres'].map((label, detailIndex) => (
                                      <Input
                                        key={label}
                                        placeholder={label}
                                        value={section.items?.[detailIndex] || ''}
                                        onChange={(e) => {
                                          const newSections = [...pageSections]
                                          if (!newSections[index].items) {
                                            newSections[index].items = ['', '', '']
                                          }
                                          newSections[index].items![detailIndex] = e.target.value
                                          setSectionsWithHistory(newSections)
                                        }}
                                      />
                                    ))}
                                  </div>
                                )}
                              </>
                            )}

                            {section.type === 'features' && (
                              <>
                                <Input
                                  className="mb-2"
                                  placeholder="Başlık"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].title = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <Textarea
                                  className="mb-2"
                                  placeholder="Açıklama"
                                  rows={3}
                                  value={section.content || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].content = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <div className="space-y-2">
                                  {(section.items || ['', '', '']).map((item: string, i: number) => (
                                    <div key={i} className="flex gap-2">
                                      <Input
                                        placeholder={`Özellik ${i + 1}`}
                                        value={item || ''}
                                        onChange={(e) => {
                                          const newSections = [...pageSections]
                                          if (!newSections[index].items) newSections[index].items = ['', '', '']
                                          newSections[index].items[i] = e.target.value
                                          setSectionsWithHistory(newSections)
                                        }}
                                      />
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const newSections = [...pageSections]
                                          newSections[index].items = (newSections[index].items || []).filter((_: any, xi: number) => xi !== i)
                                          setSectionsWithHistory(newSections)
                                        }}
                                      >
                                        X
                                      </Button>
                                    </div>
                                  ))}
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      const newSections = [...pageSections]
                                      if (!newSections[index].items) newSections[index].items = []
                                      newSections[index].items = [...newSections[index].items, '']
                                      setSectionsWithHistory(newSections)
                                    }}
                                  >
                                    + Özellik Ekle
                                  </Button>
                                </div>
                              </>
                            )}

                            {section.type === 'gallery' && (
                              <>
                                <Input
                                  className="mb-2"
                                  placeholder="Başlık"
                                  value={section.title || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].title = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <Textarea
                                  className="mb-2"
                                  placeholder="Açıklama"
                                  rows={3}
                                  value={section.content || ''}
                                  onChange={(e) => {
                                    const newSections = [...pageSections]
                                    newSections[index].content = e.target.value
                                    setSectionsWithHistory(newSections)
                                  }}
                                />
                                <div className="grid grid-cols-4 gap-2 mb-2">
                                  {(section.items || []).map((img: string, i: number) => (
                                    <div key={i} className="relative">
                                      <img src={img} alt={`Gallery ${i}`} className="w-full h-20 object-cover rounded" />
                                      <button
                                        onClick={() => {
                                          const newSections = [...pageSections]
                                          newSections[index].items = (newSections[index].items || []).filter((_: any, xi: number) => xi !== i)
                                          setSectionsWithHistory(newSections)
                                        }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs"
                                      >
                                        X
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                <label className="cursor-pointer bg-stone-200 hover:bg-stone-300 px-3 py-2 rounded inline-flex items-center gap-2">
                                  <Upload className="w-4 h-4" />
                                  <span className="text-sm">Görsel Ekle</span>
                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    multiple
                                    onChange={async (e) => {
                                      const files = e.target.files
                                      if (!files) return
                                      setIsUploading(true)
                                      try {
                                        for (const file of Array.from(files)) {
                                          const uploadedUrl = await uploadMediaAsset(file, {
                                            folder: `oztelevi/pages/${selectedPageSlug}`,
                                            tags: ['page', selectedPageSlug, 'gallery'],
                                          })
                                          const newSections = [...pageSections]
                                          if (!newSections[index].items) newSections[index].items = []
                                          newSections[index].items = [...newSections[index].items, uploadedUrl]
                                          setSectionsWithHistory(newSections)
                                        }
                                      } catch (error) {
                                        alert(error instanceof Error ? error.message : 'Yukleme hatasi')
                                      } finally {
                                        setIsUploading(false)
                                      }
                                    }}
                                    disabled={isUploading}
                                  />
                                </label>
                              </>
                            )}
                          </div>
                        ))}
                        {pageSections.length === 0 && (
                          <p className="text-stone-500 text-center py-8">
                            Henüz bölüm eklenmedi. Yukarıdaki butonlardan bölüm ekleyebilirsiniz.
                          </p>
                        )}
                      </div>
                    </>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>HTML Icerik</Label>
                  <Textarea
                    value={pageForm.htmlContent}
                    onChange={(e) => setPageForm((prev) => ({ ...prev, htmlContent: e.target.value }))}
                    rows={16}
                    placeholder="Bu alana tam sayfa HTML icerigi girebilirsiniz"
                  />
                </div>

                <div className="space-y-2">
                  <Label>JSON-LD (opsiyonel)</Label>
                  <Textarea
                    value={pageForm.schemaJson}
                    onChange={(e) => setPageForm((prev) => ({ ...prev, schemaJson: e.target.value }))}
                    rows={6}
                    placeholder='{"@context":"https://schema.org"}'
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => handleSavePage(false)} disabled={isSavingPage}>
                    Taslak Kaydet
                  </Button>
                  <Button onClick={() => handleSavePage(true)} disabled={isSavingPage}>
                    {isSavingPage ? 'Kaydediliyor...' : 'Yayina Al'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      <ProductFormDialog
        open={productDialogOpen}
        onOpenChange={setProductDialogOpen}
        editingProduct={editingProduct ? { id: editingProduct.id } : null}
        isUploading={isUploading}
        uploadError={uploadError}
        mediaStorageMode={mediaStorageMode}
        mediaStorageWarning={mediaStorageWarning}
        form={productForm}
        newFeature={newFeature}
        fields={PRODUCT_FORM_FIELDS}
        mediaLibrary={mediaLibrary}
        isMediaLoading={isMediaLoading}
        onRefreshMedia={() => void fetchMediaLibrary()}
        onDeleteMedia={handleDeleteMedia}
        onUpdateMediaTags={handleUpdateMediaTags}
        onSelectMediaMain={(url) => applyMediaToProduct(url, 'main')}
        onSelectMediaGallery={(url) => applyMediaToProduct(url, 'gallery')}
        onFieldChange={updateProductField}
        onAutoSlug={(name) => updateProductField('slug', generateSlug(name))}
        onFileUpload={handleFileUpload}
        onRemoveImage={removeImage}
        onFeatureInputChange={setNewFeature}
        onAddFeature={addFeature}
        onRemoveFeature={removeFeature}
        onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct}
      />

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
