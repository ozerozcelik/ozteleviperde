'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo, OzTeleviLogoLight } from '@/components/OzTeleviLogo'
import { CartIcon } from '@/components/CartIcon'
import { CartDrawer } from '@/components/CartDrawer'
import { useCart } from '@/contexts/CartContext'
import ManagedPage from '@/components/ManagedPage'
import { usePageContent } from '@/hooks/usePageContent'

// ============================================
// ÖzTelevi Galeri - Ev Tekstili ve Perdeleri
// Japandi Tasarım: Japon minimalizmi × İskandinav sıcaklığı
// ============================================

interface GalleryImage {
  id: string
  src: string
  alt: string
  category: string
  title: string
  description: string
  productId?: string
  inStock?: boolean
  price?: number
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  image: string | null
  images: string | null
  inStock: boolean
  featured: boolean
}

// Fallback görseller (API'den veri gelmezse)
const fallbackImages: GalleryImage[] = [
  {
    id: '1',
    src: '/images/hero.png',
    alt: 'Güneş ışığıyla dolu salon, akan keten perdeler',
    category: 'Perdeler',
    title: 'Aira Keten Perdeler',
    description: 'Güneş ışığıyla dolu salonda akan keten perdeler',
  },
  {
    id: '2',
    src: '/images/product-curtain.png',
    alt: 'El dokuma keten perde detayı',
    category: 'Perdeler',
    title: 'Doğal Keten Perde',
    description: 'El dokuma keten perde detayı',
  },
  {
    id: '3',
    src: '/images/product-textile.png',
    alt: 'Organik pamuk tekstil ürünleri',
    category: 'Tekstiller',
    title: 'Moku Organik Tekstiller',
    description: 'Toprak tonlarında el dokuma tekstiller',
  },
  {
    id: '4',
    src: '/images/scene-bedroom.png',
    alt: 'Doğal tekstillerle huzurlu yatak odası',
    category: 'Yatak Odası',
    title: 'Nami Yatak Takımı',
    description: 'Huzurlu yatak odası dekorasyonu',
  },
  {
    id: '5',
    src: '/images/hero.png',
    alt: 'Minimalist salon tasarımı',
    category: 'Aksesuarlar',
    title: 'Dekoratif Aksesuarlar',
    description: 'Minimalist salon aksesuarları',
  },
  {
    id: '6',
    src: '/images/product-curtain.png',
    alt: 'Sora tül paneller',
    category: 'Perdeler',
    title: 'Sora Tül Paneller',
    description: 'Yumuşak ışık için zarif yarı şeffaf perdeler',
  },
  {
    id: '7',
    src: '/images/scene-bedroom.png',
    alt: 'Lüks yatak odası tekstilleri',
    category: 'Yatak Odası',
    title: 'Lüks Yatak Örtüsü',
    description: 'Organik keten yatak örtüsü koleksiyonu',
  },
  {
    id: '8',
    src: '/images/product-textile.png',
    alt: 'El dokuma atkılar',
    category: 'Tekstiller',
    title: 'El Dokuma Atkılar',
    description: 'Doğal tonlarda el dokuma pamuk atkılar',
  },
]

const categoryLabels: Record<string, string> = {
  'perdeler': 'Perdeler',
  'tekstiller': 'Tekstiller',
  'yatak-odasi': 'Yatak Odası',
  'aksesuarlar': 'Aksesuarlar',
}

const categories = [
  { id: 'all', label: 'Tümü' },
  { id: 'perdeler', label: 'Perdeler' },
  { id: 'tekstiller', label: 'Tekstiller' },
  { id: 'yatak-odasi', label: 'Yatak Odası' },
  { id: 'aksesuarlar', label: 'Aksesuarlar' },
]

export default function GalleryPage() {
  const { content: managedPage } = usePageContent('galeri')

  const [activeFilter, setActiveFilter] = useState('all')
  const [lightboxImage, setLightboxImage] = useState<GalleryImage | null>(null)
  const [isLoaded] = useState(true)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const { openDrawer } = useCart()
  
  // Dinamik ürün state'leri
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  // Ürünleri API'den çek
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=100')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setProducts(data.data)
        } else {
          setUseFallback(true)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setUseFallback(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProducts()
  }, [])

  // Ürünleri galeri formatına çevir
  const galleryImages: GalleryImage[] = useFallback 
    ? fallbackImages
    : products.map((product) => ({
        id: product.id,
        src: product.image || '/images/product-curtain.png',
        alt: product.name,
        category: product.category,
        title: product.name,
        description: product.description,
        productId: product.id,
        inStock: product.inStock,
        price: product.price,
      }))

  const filteredImages = activeFilter === 'all'
    ? galleryImages
    : galleryImages.filter(img => img.category === activeFilter)

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '-20px' }
    )

    document.querySelectorAll('section, .gallery-item').forEach((el) => {
      observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [filteredImages])

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxImage) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [lightboxImage])

  // Handle escape key for lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxImage(null)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (managedPage?.htmlContent || managedPage?.heroTitle) {
    return <ManagedPage 
      html={managedPage.htmlContent} 
      schemaJson={managedPage.schemaJson}
      heroTitle={managedPage.heroTitle}
      heroSubtitle={managedPage.heroSubtitle}
      heroImage={managedPage.heroImage}
      heroCtaText={managedPage.heroCtaText}
      heroCtaLink={managedPage.heroCtaLink}
      sections={managedPage.sections}
    />
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <GalleryHero isLoaded={isLoaded} />
        
        {/* Gallery Grid Section */}
        <GalleryGrid 
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          filteredImages={filteredImages}
          onImageClick={setLightboxImage}
          isLoading={isLoading}
        />
      </main>
      
      {/* Footer */}
      <Footer />

      {/* Lightbox */}
      {lightboxImage && (
        <Lightbox image={lightboxImage} onClose={() => setLightboxImage(null)} />
      )}
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}

// ============================================
// Navigation Component
// ============================================
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/#felsefe', label: 'Felsefemiz' },
    { href: '/#koleksiyon', label: 'Koleksiyon' },
    { href: '/galeri', label: 'Galeri' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-background/80'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <OzTeleviLogo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className={`text-sm tracking-wide transition-all duration-500 relative ${
                  link.href === '/galeri'
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-500 ${
                    link.href === '/galeri'
                      ? 'w-full'
                      : 'w-0 hover:w-full'
                  }`}
                />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:flex items-center gap-4">
            <CartIcon />
            <a
              href="/#iletisim"
              className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
            >
              Bize Ulaşın
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <CartIcon />
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-foreground"
              aria-label="Menüyü aç/kapat"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-6 h-6"
              >
                {isMobileMenuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md border-t border-border/50 ${
            isMobileMenuOpen ? 'max-h-[70vh] pb-6 overflow-y-auto' : 'max-h-0'
          }`}
        >
          <div className="flex flex-col gap-4 pt-4">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="/#iletisim"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-2 px-6 py-3 bg-foreground text-background text-center text-sm tracking-wide rounded-full"
            >
              Bize Ulaşın
            </a>
          </div>
        </div>
      </nav>
    </header>
  )
}

// ============================================
// Gallery Hero Section
// ============================================
function GalleryHero({ isLoaded }: { isLoaded: boolean }) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 bg-background overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-wood-200/30 blur-3xl animate-breathe" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-sage-200/30 blur-3xl animate-breathe stagger-2" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative text-center">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 font-medium">
            Yaşam alanlarınızı keşfedin
          </p>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-foreground mb-6 transition-all duration-1000 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="font-normal italic">Galeri</span>
        </h1>

        <p
          className={`max-w-2xl mx-auto text-lg text-muted-foreground leading-relaxed transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          Yaşam alanlarınızı ilham verin
        </p>
      </div>
    </section>
  )
}

// ============================================
// Gallery Grid Section
// ============================================
interface GalleryGridProps {
  activeFilter: string
  setActiveFilter: (filter: string) => void
  filteredImages: GalleryImage[]
  onImageClick: (image: GalleryImage) => void
  isLoading: boolean
}

function GalleryGrid({ activeFilter, setActiveFilter, filteredImages, onImageClick, isLoading }: GalleryGridProps) {
  const { addItem, openDrawer } = useCart()
  const [addingProductId, setAddingProductId] = useState<string | null>(null)
  
  const handleAddToCart = async (e: React.MouseEvent, image: GalleryImage) => {
    e.stopPropagation()
    if (!image.productId) return
    
    setAddingProductId(image.id)
    await addItem(image.productId, 1)
    setTimeout(() => {
      setAddingProductId(null)
      openDrawer()
    }, 500)
  }
  
  return (
    <section className="py-12 md:py-20 bg-sand-50 relative">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Filter Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveFilter(category.id)}
              className={`px-6 py-2.5 text-sm tracking-wide rounded-full transition-all duration-500 ${
                activeFilter === category.id
                  ? 'bg-foreground text-background'
                  : 'bg-background border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          </div>
        )}

        {/* Image Grid */}
        {!isLoading && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredImages.map((image, index) => (
            <article
              key={image.id}
              onClick={() => onImageClick(image)}
              className={`gallery-item group cursor-pointer opacity-0 translate-y-8 animate-fade-in-up stagger-${(index % 5) + 1} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
            >
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100">
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Overlay Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                  <span className="text-xs tracking-widest uppercase text-white/70 mb-2">
                    {categoryLabels[image.category] || image.category}
                  </span>
                  <h3 className="text-lg font-medium text-white mb-1">
                    {image.title}
                  </h3>
                  <p className="text-sm text-white/80">
                    {image.description}
                  </p>
                </div>

                {/* Zoom Icon */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  {/* Sepete Ekle Butonu */}
                  {image.productId && (
                    <button
                      onClick={(e) => handleAddToCart(e, image)}
                      disabled={addingProductId === image.id || !image.inStock}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${
                        addingProductId === image.id
                          ? 'bg-sage-400 text-white scale-110'
                          : 'bg-white/90 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100'
                      } disabled:opacity-50`}
                      aria-label="Sepete Ekle"
                    >
                      {addingProductId === image.id ? (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                      )}
                    </button>
                  )}
                  <div className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 scale-75 group-hover:scale-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-foreground"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                    </svg>
                  </div>
                </div>

                {/* Category Badge */}
                <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium transition-all duration-500 group-hover:opacity-0">
                  {categoryLabels[image.category] || image.category}
                </span>
              </div>
            </article>
          ))}
        </div>
        )}

        {/* Empty State */}
        {!isLoading && filteredImages.length === 0 && (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">
              Bu kategoride henüz görsel bulunmamaktadır.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

// ============================================
// Lightbox Component
// ============================================
interface LightboxProps {
  image: GalleryImage
  onClose: () => void
}

function Lightbox({ image, onClose }: LightboxProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 group z-10"
        aria-label="Kapat"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="w-6 h-6 text-white transition-transform duration-300 group-hover:rotate-90"
        >
          <path d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Image Container */}
      <div
        className="relative max-w-5xl w-full mx-6 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sand-100 shadow-2xl">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Image Info */}
        <div className="mt-6 text-center">
          <span className="text-xs tracking-widest uppercase text-white/60 mb-2 block">
            {categoryLabels[image.category] || image.category}
          </span>
          <h3 className="text-2xl font-medium text-white mb-2">
            {image.title}
          </h3>
          <p className="text-white/70">
            {image.description}
          </p>
        </div>
      </div>

      {/* Navigation Arrows - Decorative for now */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2">
        <button
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 opacity-50"
          aria-label="Önceki görsel"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 text-white"
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>
      <div className="absolute right-6 top-1/2 -translate-y-1/2">
        <button
          className="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all duration-300 opacity-50"
          aria-label="Sonraki görsel"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 text-white"
          >
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  )
}

// ============================================
// Footer Component
// ============================================
function Footer() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setEmail('')
      } else {
        setSubmitStatus('error')
      }
    } catch {
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <footer className="bg-foreground text-background py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <OzTeleviLogoLight />
            <p className="mt-6 text-background/70 leading-relaxed max-w-md">
              Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan,
              el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur,
              doğal ışık ve zamansız bir zarafet davetiyesidir.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-background/50 mb-6">
              Hızlı Linkler
            </h4>
            <ul className="space-y-3">
              <li>
                <a href="/#felsefe" className="text-background/70 hover:text-background transition-colors duration-300">
                  Felsefemiz
                </a>
              </li>
              <li>
                <a href="/#koleksiyon" className="text-background/70 hover:text-background transition-colors duration-300">
                  Koleksiyon
                </a>
              </li>
              <li>
                <a href="/galeri" className="text-background/70 hover:text-background transition-colors duration-300">
                  Galeri
                </a>
              </li>
              <li>
                <a href="/#iletisim" className="text-background/70 hover:text-background transition-colors duration-300">
                  İletişim
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm tracking-widest uppercase text-background/50 mb-6">
              İletişim
            </h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>info@oztelevi.com</span>
              </li>
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>+90 (212) 555 0123</span>
              </li>
              <li className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-background/10 pt-12 mb-12">
          <div className="max-w-md mx-auto text-center">
            <h4 className="text-lg font-medium text-background mb-2">
              Bültenimize Abone Olun
            </h4>
            <p className="text-background/70 text-sm mb-6">
              Yeni koleksiyonlar ve özel tekliflerden ilk siz haberdar olun.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                className="flex-1 px-4 py-3 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors"
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-background text-foreground text-sm tracking-wide rounded-lg font-medium transition-all duration-500 hover:bg-background/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? '...' : 'Abone Ol'}
              </button>
            </form>
            {submitStatus === 'success' && (
              <p className="mt-3 text-sm text-green-400">Başarıyla abone oldunuz!</p>
            )}
            {submitStatus === 'error' && (
              <p className="mt-3 text-sm text-red-400">Bir hata oluştu. Lütfen tekrar deneyin.</p>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {new Date().getFullYear()} ÖzTelevi. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-background/50 hover:text-background transition-colors duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
            </a>
            <a href="#" className="text-background/50 hover:text-background transition-colors duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
              </svg>
            </a>
            <a href="#" className="text-background/50 hover:text-background transition-colors duration-300">
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

