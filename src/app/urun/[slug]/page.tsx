'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { OzTeleviLogo, OzTeleviLogoLight } from '@/components/OzTeleviLogo'
import { useCart } from '@/contexts/CartContext'
import { CartIcon } from '@/components/CartIcon'
import { CartDrawer } from '@/components/CartDrawer'
import { ProductJsonLd, BreadcrumbJsonLd } from '@/components/JsonLd'

// ============================================
// Types & Interfaces
// ============================================
interface ProductParams {
  slug: string
}

interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  image: string
  images: string[]
  features: string[]
  inStock: boolean
}

// ============================================
// Static Product Data for Fallback (when DB is empty)
// ============================================
const fallbackProducts: Product[] = [
  {
    id: '1',
    slug: 'aira-keten-perdeler',
    name: 'Aira Keten Perdeler',
    description: 'Belçika keteninden el yapımı, ışık süzen zarif perdeler. Doğal drapeli yapısıyla güneş ışığını yumuşak bir şekilde süzerken, mekanınıza sıcaklık ve huzur katar. Minimalist Japandi estetiğinde tasarlanan bu perdeler, her türlü iç mekanla mükemmel uyum sağlar. Ketenin doğal dokusu, zamansız bir zarafet sunar ve yıllar geçtikçe daha da güzelleşir.',
    price: 280000,
    currency: 'TRY',
    category: 'Perdeler',
    image: '/images/product-curtain.png',
    images: [
      '/images/product-curtain.png',
      '/images/hero.png',
      '/images/scene-bedroom.png',
    ],
    features: [
      '100% Belçika keteni',
      'El dokuma kenar detayları',
      'Işık süzen yapı',
      'Doğal antibakteriyel özellik',
      'Makinede yıkanabilir (30°C)',
      'Ütüleme gerektirmez',
    ],
    inStock: true,
  },
  {
    id: '2',
    slug: 'moku-organik-atkilar',
    name: 'Moku Organik Atkılar',
    description: 'Toprak tonlarında el dokuma organik pamuk atkılar. Japon "wabi-sabi" felsefesinden ilham alan bu atkılar, doğal kusurların güzelliğini kucaklar. Her parça benzersizdir ve ustalarımızın ellerinde şekil alır. Sıcak tutan yapısıyla kış aylarında mükemmel bir tamamlayıcıdır.',
    price: 145000,
    currency: 'TRY',
    category: 'Tekstiller',
    image: '/images/product-textile.png',
    images: [
      '/images/product-textile.png',
      '/images/hero.png',
    ],
    features: [
      'GOTS sertifikalı organik pamuk',
      'El dokuma teknikle üretilmiş',
      'Doğal bitkisel boyalar',
      'Cilt dostu ve hipoalerjenik',
      'El yıkama önerilir',
      'Her parça benzersiz',
    ],
    inStock: true,
  },
  {
    id: '3',
    slug: 'sora-tul-paneller',
    name: 'Sora Tül Paneller',
    description: 'Yumuşak ışık için zarif yarı şeffaf perdeler. Japon kağıt perdelerden ilham alan Sora koleksiyonu, ışığı mekan içinde dans ettirir. Minimalist paneller, modern ve klasik iç mekanlara eşit derecede uyum sağlar. Katlanabilir panel sistemi ile kolay kullanım sağlar.',
    price: 195000,
    currency: 'TRY',
    category: 'Perdeler',
    image: '/images/hero.png',
    images: [
      '/images/hero.png',
      '/images/product-curtain.png',
      '/images/scene-bedroom.png',
    ],
    features: [
      'Yarı şeffaf polyester karışım',
      'Panel sistemli mekanizma',
      'UV korumalı malzeme',
      'Toz tutmaz özellik',
      'Kolay temizlenebilir',
      'Ölçüye özel üretim',
    ],
    inStock: true,
  },
  {
    id: '4',
    slug: 'nami-yatak-takimi',
    name: 'Nami Yatak Takımı',
    description: 'Doğal tonlarda %100 organik keten yatak örtüsü takımı. "Nami" Japonca\'da "dalga" anlamına gelir ve bu koleksiyonun akıcı, sakin tasarımını yansıtır. İçinde 1 adet yatak örtüsü, 2 adet yastık kılıfı ve 1 adet yastık yüzü bulunur. Uyku kalitenizi artıran nefes alan yapısıyla huzurlu geceler vaat eder.',
    price: 320000,
    currency: 'TRY',
    category: 'Yatak Odası',
    image: '/images/scene-bedroom.png',
    images: [
      '/images/scene-bedroom.png',
      '/images/product-textile.png',
      '/images/hero.png',
    ],
    features: [
      '100% organik Avrupa keteni',
      '4 parçalı takım',
      'Nefes alabilir yapı',
      'Termal regülasyon özelliği',
      'Yıllandıkça yumuşar',
      'Makinede yıkanabilir',
    ],
    inStock: true,
  },
]

const categoryLabels: Record<string, string> = {
  'perdeler': 'Perdeler',
  'tekstiller': 'Tekstiller',
  'yatak-odasi': 'Yatak Odası',
  'aksesuarlar': 'Aksesuarlar',
}

// ============================================
// Main Product Detail Page Component
// ============================================
export default function ProductDetailPage() {
  const params = useParams<ProductParams>()
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  
  // Sepet hook'u
  const { addItem, openDrawer } = useCart()
  
  // Dinamik ürün state'leri
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)

  // Ürünü API'den çek
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        // Önce slug ile ürünü çek
        const res = await fetch(`/api/products?slug=${params.slug}`)
        const data = await res.json()
        
        if (data.success && data.data) {
          // API'den gelen ürün
          const apiProduct = data.data
          const mainImage = apiProduct.image || '/images/product-curtain.png'
          const parsedProduct: Product = {
            ...apiProduct,
            image: mainImage,
            // Ana görsel + ek görseller birleşik
            images: [
              mainImage, // Ana görsel her zaman ilk sırada
              ...(apiProduct.images || []) // Ek görseller
            ],
            features: apiProduct.features || [],
            category: categoryLabels[apiProduct.category] || apiProduct.category,
          }
          setProduct(parsedProduct)
          
          // İlişkili ürünleri çek (aynı kategoriden)
          const relatedRes = await fetch(`/api/products?category=${apiProduct.category}&limit=4`)
          const relatedData = await relatedRes.json()
          if (relatedData.success && relatedData.data) {
            const related = relatedData.data
              .filter((p: Product) => p.slug !== params.slug)
              .slice(0, 3)
              .map((p: Product) => {
                const mainImg = p.image || '/images/product-curtain.png'
                return {
                  ...p,
                  image: mainImg,
                  images: [mainImg, ...(p.images || [])],
                  features: p.features || [],
                  category: categoryLabels[p.category] || p.category,
                }
              })
            setRelatedProducts(related)
          }
        } else {
          // Veritabanında yok, fallback kullan
          setUseFallback(true)
        }
      } catch (error) {
        console.error('Error fetching product:', error)
        setUseFallback(true)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProduct()
  }, [params.slug])

  // Fallback ürün (statik)
  const fallbackProduct = useMemo(() => {
    if (!useFallback) return null
    return fallbackProducts.find((p) => p.slug === params.slug) || null
  }, [params.slug, useFallback])

  const fallbackRelated = useMemo(() => {
    if (!fallbackProduct) return []
    const related = fallbackProducts
      .filter((p) => p.category === fallbackProduct.category && p.slug !== params.slug)
      .slice(0, 3)
    if (related.length < 3) {
      const others = fallbackProducts
        .filter((p) => p.slug !== params.slug && !related.includes(p))
        .slice(0, 3 - related.length)
      related.push(...others)
    }
    return related
  }, [fallbackProduct, params.slug])

  // Gösterilecek ürün
  const displayProduct = useFallback ? fallbackProduct : product
  const displayRelated = useFallback ? fallbackRelated : relatedProducts

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/#felsefe', label: 'Felsefemiz' },
    { href: '/#koleksiyon', label: 'Koleksiyon' },
    { href: '/#zanaat', label: 'Zanaat' },
    { href: '/#mekanlar', label: 'Mekanlar' },
  ]

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
      </div>
    )
  }

  // Ürün bulunamadı
  if (!displayProduct) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-light text-foreground mb-4">Ürün Bulunamadı</h1>
          <p className="text-muted-foreground mb-8">Aradığınız ürün mevcut değil veya kaldırılmış olabilir.</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* SEO - JSON-LD Structured Data */}
      <ProductJsonLd
        name={displayProduct.name}
        description={displayProduct.description}
        image={displayProduct.image}
        price={displayProduct.price}
        currency={displayProduct.currency}
        slug={displayProduct.slug}
        inStock={displayProduct.inStock}
        category={displayProduct.category}
      />
      <BreadcrumbJsonLd
        items={[
          { name: 'Ana Sayfa', url: '/' },
          { name: 'Koleksiyon', url: '/#koleksiyon' },
          { name: displayProduct.name, url: `/urun/${displayProduct.slug}` },
        ]}
      />
      
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <OzTeleviLogo />

            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <CartIcon />
              <a
                href="/#iletisim"
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </a>
            </div>

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

          <div
            className={`md:hidden overflow-hidden transition-all duration-500 ${
              isMobileMenuOpen ? 'max-h-80 pb-6' : 'max-h-0'
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

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <a href="/" className="hover:text-foreground transition-colors">
              Ana Sayfa
            </a>
            <span>/</span>
            <a href="/#koleksiyon" className="hover:text-foreground transition-colors">
              Koleksiyon
            </a>
            <span>/</span>
            <span className="text-foreground">{displayProduct.name}</span>
          </nav>
        </div>

        {/* Product Detail Section */}
        <section className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Product Image Gallery */}
              <div className="space-y-4">
                {/* Main Image */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100">
                  <Image
                    src={displayProduct.images[selectedImage]}
                    alt={displayProduct.name}
                    fill
                    className="object-cover transition-transform duration-700"
                    priority
                  />
                  <span className="absolute top-4 left-4 px-3 py-1.5 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                    {displayProduct.category}
                  </span>
                  {displayProduct.inStock && (
                    <span className="absolute top-4 right-4 px-3 py-1.5 bg-sage-100 text-xs tracking-wide rounded-full text-sage-400 font-medium">
                      Stokta
                    </span>
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {displayProduct.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden flex-shrink-0 transition-all duration-300 ${
                        selectedImage === index
                          ? 'ring-2 ring-foreground ring-offset-2'
                          : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image
                        src={img}
                        alt={`${displayProduct.name} - Görsel ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Product Info */}
              <div className="flex flex-col">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-foreground leading-tight mb-4">
                  {displayProduct.name}
                </h1>

                <p className="text-2xl md:text-3xl font-light text-foreground mb-6">
                  {displayProduct.price.toLocaleString('tr-TR')} ₺
                  <span className="text-sm text-muted-foreground ml-2">'den başlayan</span>
                </p>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {displayProduct.description}
                </p>

                {/* Features */}
                <div className="mb-8">
                  <h3 className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-4">
                    Özellikler
                  </h3>
                  <ul className="space-y-3">
                    {displayProduct.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="w-5 h-5 text-wood-400 flex-shrink-0 mt-0.5"
                        >
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        <span className="text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Quantity Selector */}
                <div className="mb-6">
                  <label className="text-sm tracking-[0.2em] uppercase text-muted-foreground mb-3 block">
                    Adet
                  </label>
                  <div className="flex items-center border border-border rounded-lg w-fit">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                      aria-label="Azalt"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M5 12h14" />
                      </svg>
                    </button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-10 h-10 flex items-center justify-center text-foreground hover:bg-muted transition-colors"
                      aria-label="Artır"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-auto">
                  <button
                    onClick={async () => {
                      if (!displayProduct) return
                      setIsAddingToCart(true)
                      const success = await addItem(displayProduct.id, quantity)
                      if (success) {
                        setAddedToCart(true)
                        setTimeout(() => {
                          setAddedToCart(false)
                          openDrawer()
                        }, 800)
                      }
                      setIsAddingToCart(false)
                    }}
                    disabled={isAddingToCart || !displayProduct?.inStock}
                    className={`flex-1 px-8 py-4 text-sm tracking-wide rounded-full transition-all duration-500 text-center flex items-center justify-center gap-2 ${
                      addedToCart
                        ? 'bg-sage-400 text-white'
                        : 'bg-foreground text-background hover:bg-foreground/90 hover:shadow-xl hover:-translate-y-0.5'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isAddingToCart ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current"></div>
                    ) : addedToCart ? (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                        Sepete Eklendi
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                          <path d="M3 6h18" />
                          <path d="M16 10a4 4 0 01-8 0" />
                        </svg>
                        Sepete Ekle
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsQuoteModalOpen(true)}
                    className="flex-1 px-8 py-4 border border-foreground/30 text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5 text-center"
                  >
                    Teklif İste
                  </button>
                </div>
                
                {/* Phone CTA */}
                <div className="mt-4">
                  <a
                    href="tel:+902125550123"
                    className="flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-4 h-4"
                    >
                      <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Hemen Arayın: +90 (212) 555 0123
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="flex flex-wrap gap-6 mt-8 pt-8 border-t border-border/50">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-wood-400"
                    >
                      <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    Ücretsiz Kargo
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-wood-400"
                    >
                      <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    2 Yıl Garanti
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-wood-400"
                    >
                      <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    30 Gün İade
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Related Products Section */}
        <section className="py-16 md:py-24 bg-sand-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="mb-12">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
                Benzer Ürünler
              </p>
              <h2 className="text-2xl md:text-3xl font-light text-foreground">
                İlginizi Çekebilir
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {displayRelated.map((relatedProduct) => (
                <article
                  key={relatedProduct.id}
                  onClick={() => {
                    router.push(`/urun/${relatedProduct.slug}`)
                    window.scrollTo(0, 0)
                  }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100 mb-5">
                    <Image
                      src={relatedProduct.image}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                      {relatedProduct.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1 group-hover:text-muted-foreground transition-colors duration-300">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {relatedProduct.description.slice(0, 60)}...
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {relatedProduct.price.toLocaleString('tr-TR')} ₺'den başayan
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Request CTA */}
        <section className="py-16 md:py-24 bg-wood-50">
          <div className="max-w-3xl mx-auto px-6 lg:px-8 text-center">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-4">
              Özel Tasarım
            </p>
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">
              Mekanınıza özel tasarım mı istiyorsunuz?
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Tasarım danışmanlarımız, mekanınızın ihtiyaçlarına göre size özel çözümler sunmak için hazır.
              Ücretsiz keşif randevusu almak için bize ulaşın.
            </p>
            <button
              onClick={() => setIsQuoteModalOpen(true)}
              className="px-8 py-4 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-xl hover:-translate-y-0.5"
            >
              Ücretsiz Keşif Randevusu Al
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />

      {/* Quote Request Modal */}
      {isQuoteModalOpen && displayProduct && (
        <QuoteRequestModal
          product={displayProduct}
          onClose={() => setIsQuoteModalOpen(false)}
        />
      )}
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}

// ============================================
// Quote Request Modal Component
// ============================================
function QuoteRequestModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: `Merhaba, ${product.name} ürünü hakkında teklif almak istiyorum.`,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          productType: product.name,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setTimeout(() => {
          onClose()
        }, 2000)
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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-lg bg-background rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div>
            <h3 className="text-xl font-medium text-foreground">Teklif İste</h3>
            <p className="text-sm text-muted-foreground mt-1">{product.name}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Kapat"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-6 h-6"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label htmlFor="quote-name" className="block text-sm text-muted-foreground mb-2">
              Adınız Soyadınız *
            </label>
            <input
              type="text"
              id="quote-name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 bg-sand-50 border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
              placeholder="Adınızı giriniz"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="quote-email" className="block text-sm text-muted-foreground mb-2">
                E-posta *
              </label>
              <input
                type="email"
                id="quote-email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-sand-50 border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="ornek@email.com"
              />
            </div>
            <div>
              <label htmlFor="quote-phone" className="block text-sm text-muted-foreground mb-2">
                Telefon
              </label>
              <input
                type="tel"
                id="quote-phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-sand-50 border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors"
                placeholder="+90 5XX XXX XX XX"
              />
            </div>
          </div>

          <div>
            <label htmlFor="quote-message" className="block text-sm text-muted-foreground mb-2">
              Mesajınız *
            </label>
            <textarea
              id="quote-message"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 bg-sand-50 border border-border rounded-lg text-foreground placeholder-muted-foreground/50 focus:outline-none focus:border-foreground/30 transition-colors resize-none"
              placeholder="Nasıl yardımcı olabiliriz?"
            />
          </div>

          {submitStatus === 'success' && (
            <div className="p-4 bg-sage-50 border border-sage-200 rounded-lg text-sage-400 text-sm">
              Teklif talebiniz başarıyla alındı. En kısa sürede size dönüş yapacağız.
            </div>
          )}

          {submitStatus === 'error' && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-500 text-sm">
              Teklif talebiniz gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-foreground text-background text-sm tracking-wide rounded-lg font-medium transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Teklif Talebi Gönder'}
          </button>
        </form>
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
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <OzTeleviLogoLight />
            <p className="mt-6 text-background/70 leading-relaxed max-w-md">
              Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan,
              el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur davetidir.
            </p>

            {/* Newsletter */}
            <div className="mt-8">
              <p className="text-sm text-background/80 mb-3">Bültenimize abone olun</p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="E-posta adresiniz"
                  className="flex-1 px-4 py-2.5 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-background text-foreground text-sm tracking-wide rounded-lg transition-all duration-500 hover:bg-background/90 disabled:opacity-50"
                >
                  {isSubmitting ? '...' : 'Abone'}
                </button>
              </form>
              {submitStatus === 'success' && (
                <p className="text-xs text-sage-300 mt-2">Başarıyla abone oldunuz!</p>
              )}
              {submitStatus === 'error' && (
                <p className="text-xs text-red-300 mt-2">Bir hata oluştu. Lütfen tekrar deneyiniz.</p>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-medium text-background mb-4">Hızlı Linkler</h4>
            <ul className="space-y-3">
              <li>
                <a href="/#felsefe" className="text-background/70 hover:text-background transition-colors text-sm">
                  Felsefemiz
                </a>
              </li>
              <li>
                <a href="/#koleksiyon" className="text-background/70 hover:text-background transition-colors text-sm">
                  Koleksiyon
                </a>
              </li>
              <li>
                <a href="/#zanaat" className="text-background/70 hover:text-background transition-colors text-sm">
                  Zanaat
                </a>
              </li>
              <li>
                <a href="/#mekanlar" className="text-background/70 hover:text-background transition-colors text-sm">
                  Mekanlar
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-background mb-4">İletişim</h4>
            <ul className="space-y-3 text-sm text-background/70">
              <li>Teşvikiye Mah., Bağdar Caddesi No:42</li>
              <li>Şişli, İstanbul</li>
              <li className="pt-2">
                <a href="tel:+902125550123" className="hover:text-background transition-colors">
                  +90 (212) 555 0123
                </a>
              </li>
              <li>
                <a href="mailto:info@oztelevi.com" className="hover:text-background transition-colors">
                  info@oztelevi.com
                </a>
              </li>
            </ul>

            {/* Social Links */}
            <div className="flex gap-4 mt-6">
              <a href="#" className="text-background/60 hover:text-background transition-colors" aria-label="Instagram">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
              <a href="#" className="text-background/60 hover:text-background transition-colors" aria-label="Pinterest">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                  <path d="M12 0c-6.627 0-12 5.372-12 12 0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} ÖzTelevi. Tüm hakları saklıdır.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-background/70 transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-background/70 transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
