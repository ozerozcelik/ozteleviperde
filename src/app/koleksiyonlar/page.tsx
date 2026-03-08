'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import ManagedPage from '@/components/ManagedPage'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

// ============================================
// Types
// ============================================
interface Collection {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

// ============================================
// Fallback Collections
// ============================================
const fallbackCollections: Collection[] = [
  {
    id: '1',
    name: 'Aira Koleksiyonu',
    slug: 'aira',
    description: 'Işık süzen keten perdeler ve zarif drapeler. Belçika keteninden üretilen bu koleksiyon, doğal ışığı yaşam alanlarınıza taşıyor.',
    image: '/images/hero.png',
    featured: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Moku Serisi',
    slug: 'moku',
    description: 'El dokuma organik pamuk atkılar ve tekstiller. Toprak tonlarında, doğanın renklerini yaşam alanlarınıza getiriyor.',
    image: '/images/product-textile.png',
    featured: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Sora Paneller',
    slug: 'sora',
    description: 'Yumuşak ışık için zarif yarı şeffaf tül paneller. Minimalist estetik ve fonksiyonellik bir arada.',
    image: '/images/product-curtain.png',
    featured: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    name: 'Nami Yatak Odası',
    slug: 'nami',
    description: 'Doğal tonlarda %100 organik keten yatak takımları. Huzurlu uyku için tasarlanmış, cildinize saygılı tekstiller.',
    image: '/images/scene-bedroom.png',
    featured: false,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    name: 'Kumo Tekstiller',
    slug: 'kumo',
    description: 'Bulut gibi yumuşak, nefes alan kumaşlardan üretilmiş yastık ve örtüler. Japon estetiğinin sıcak dokunuşu.',
    image: '/images/product-textile.png',
    featured: false,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    name: 'Yuki Kış Koleksiyonu',
    slug: 'yuki',
    description: 'Soğuk kış günleri için tasarlanmış kalın, izole perdeler ve sıcak tekstiller. Enerji tasarrufu ve konfor bir arada.',
    image: '/images/hero.png',
    featured: false,
    order: 6,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

// ============================================
// Collections Page Component
// ============================================
export default function CollectionsPage() {
  const { contact } = useSiteSettings()
  const { content: managedPage } = usePageContent('koleksiyonlar')

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [collections, setCollections] = useState<Collection[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        // Try to fetch from API
        const res = await fetch('/api/collections')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.data && data.data.length > 0) {
            setCollections(data.data)
          } else {
            setCollections(fallbackCollections)
          }
        } else {
          setCollections(fallbackCollections)
        }
      } catch (error) {
        console.error('Error fetching collections:', error)
        setCollections(fallbackCollections)
      } finally {
        setIsLoading(false)
      }
    }
    fetchCollections()
  }, [])

  const navLinks = [
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/galeri', label: 'Galeri' },
    { href: '/koleksiyonlar', label: 'Koleksiyonlar' },
    { href: '/sikca-sorulan-sorular', label: 'SSS' },
  ]

  const featuredCollections = collections.filter((c) => c.featured)
  const otherCollections = collections.filter((c) => !c.featured)

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

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-10">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-wide transition-all duration-500 relative ${
                    link.href === '/koleksiyonlar'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-500 ${
                      link.href === '/koleksiyonlar' ? 'w-full' : 'w-0'
                    }`}
                  />
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <a
                href="/#iletisim"
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
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

          {/* Mobile Menu */}
          <div
            className={`md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md border-t border-border/50 ${
              isMobileMenuOpen ? 'max-h-[70vh] pb-6 overflow-y-auto' : 'max-h-0'
            }`}
          >
            <div className="flex flex-col gap-4 pt-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
                >
                  {link.label}
                </Link>
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
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-sand-50 relative overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-wood-200/30 blur-3xl animate-breathe" />
          <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-sage-200/30 blur-3xl animate-breathe stagger-2" />

          <div className="max-w-4xl mx-auto px-6 text-center relative">
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
              Koleksiyonlar
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6">
              Zamansız <span className="font-normal italic">tasarımlar</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Her koleksiyonumuz, yaşam alanlarınıza huzur ve zarafet katmak için
              özenle tasarlanmıştır. Japandi estetiğinin en güzel örneklerini keşfedin.
            </p>
          </div>
        </section>

        {/* Loading State */}
        {isLoading && (
          <section className="py-24">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          </section>
        )}

        {/* Featured Collections */}
        {!isLoading && featuredCollections.length > 0 && (
          <section className="py-16 md:py-24 bg-background">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">
                    Öne Çıkan
                  </p>
                  <h2 className="text-2xl sm:text-3xl font-light text-foreground">
                    Seçkin <span className="font-normal italic">koleksiyonlar</span>
                  </h2>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {featuredCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} featured />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* All Collections */}
        {!isLoading && otherCollections.length > 0 && (
          <section className="py-16 md:py-24 bg-sand-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <div className="mb-12">
                <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-2">
                  Tümü
                </p>
                <h2 className="text-2xl sm:text-3xl font-light text-foreground">
                  Diğer <span className="font-normal italic">koleksiyonlar</span>
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherCollections.map((collection) => (
                  <CollectionCard key={collection.id} collection={collection} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Empty State */}
        {!isLoading && collections.length === 0 && (
          <section className="py-24 bg-background">
            <div className="max-w-md mx-auto px-6 text-center">
              <p className="text-muted-foreground">
                Henüz koleksiyon bulunmuyor.
              </p>
              <Link
                href="/galeri"
                className="mt-4 inline-block px-6 py-3 bg-foreground text-background text-sm rounded-full hover:bg-foreground/90 transition-colors"
              >
                Galeriyi Gör
              </Link>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-foreground">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-light text-background mb-4">
              Özel tasarım mı <span className="font-normal italic">arıyorsunuz?</span>
            </h2>
            <p className="text-background/80 mb-8 max-w-xl mx-auto">
              Özel ölçü ve tasarım talepleriniz için uzman ekibimizle görüşün.
              Size özel çözümler üretelim.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#iletisim"
                className="px-8 py-4 bg-background text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-background/90 hover:shadow-lg"
              >
                Teklif Alın
              </a>
              <a
                href={contact.phoneHref}
                className="px-8 py-4 border border-background/30 text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:border-background/50 hover:bg-background/5"
              >
                {contact.phoneDisplay}
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// ============================================
// Collection Card Component
// ============================================
function CollectionCard({
  collection,
  featured = false,
}: {
  collection: Collection
  featured?: boolean
}) {
  return (
    <Link
      href={`/koleksiyonlar/${collection.slug}`}
      className={`group block relative rounded-2xl overflow-hidden ${
        featured ? 'aspect-[4/3]' : 'aspect-[3/4]'
      }`}
    >
      {/* Background Image */}
      <Image
        src={collection.image || '/images/hero.png'}
        alt={collection.name}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 p-6 flex flex-col justify-end">
        <h3 className={`font-medium text-white mb-2 ${featured ? 'text-xl md:text-2xl' : 'text-lg'}`}>
          {collection.name}
        </h3>
        {collection.description && (
          <p className="text-white/80 text-sm line-clamp-2 mb-4">
            {collection.description}
          </p>
        )}
        <div className="flex items-center gap-2 text-white/90 text-sm group-hover:gap-3 transition-all duration-300">
          <span>Keşfet</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
          >
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

// ============================================
// Footer Component
// ============================================
function Footer() {
  const { contact } = useSiteSettings()
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'collections-page' }),
      })
      const data = await res.json()
      if (data.success) {
        setNewsletterStatus('success')
        setEmail('')
      } else {
        setNewsletterStatus('error')
      }
    } catch {
      setNewsletterStatus('error')
    }
  }

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <OzTeleviLogo variant="light" />
            <p className="mt-4 text-background/70 text-sm leading-relaxed">
              Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, 
              el işçiliği tekstiller ve perdeler.
            </p>
            <div className="mt-6">
              <SocialMediaButtons variant="light" size="sm" />
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-medium mb-4">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/hakkimizda" className="text-background/70 hover:text-background text-sm transition-colors">
                  Hakkımızda
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-background/70 hover:text-background text-sm transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/koleksiyonlar" className="text-background/70 hover:text-background text-sm transition-colors">
                  Koleksiyonlar
                </Link>
              </li>
              <li>
                <Link href="/sikca-sorulan-sorular" className="text-background/70 hover:text-background text-sm transition-colors">
                  Sıkça Sorulan Sorular
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-medium mb-4">İletişim</h3>
            <ul className="space-y-3 text-sm text-background/70">
              {contact.addressLines.map((line) => (
                <li key={line}>{line}</li>
              ))}
              <li className="pt-2">
                <a href={contact.phoneHref} className="hover:text-background transition-colors">
                  {contact.phoneDisplay}
                </a>
              </li>
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-background transition-colors">
                  {contact.email}
                </a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-medium mb-4">Bülten</h3>
            <p className="text-background/70 text-sm mb-4">
              Yeni koleksiyonlar ve özel tekliflerden haberdar olun.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="w-full px-4 py-2.5 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 text-sm focus:outline-none focus:border-background/40 transition-colors"
              />
              <button
                type="submit"
                className="w-full px-4 py-2.5 bg-background text-foreground text-sm rounded-lg hover:bg-background/90 transition-colors"
              >
                Abone Ol
              </button>
              {newsletterStatus === 'success' && (
                <p className="text-green-400 text-xs">Başarıyla abone oldunuz!</p>
              )}
              {newsletterStatus === 'error' && (
                <p className="text-red-400 text-xs">Bir hata oluştu. Lütfen tekrar deneyin.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} ÖzTelevi. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-background/50">
            <a href="#" className="hover:text-background/70 transition-colors">Gizlilik Politikası</a>
            <a href="#" className="hover:text-background/70 transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

