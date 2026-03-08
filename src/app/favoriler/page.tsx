'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { OzTeleviLogo, OzTeleviLogoLight } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import { useFavorites } from '@/contexts/FavoritesContext'
import ManagedPage from '@/components/ManagedPage'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

// ============================================
// Types
// ============================================
interface FavoriteProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  image: string | null
  inStock: boolean
  featured: boolean
}

interface Favorite {
  id: string
  productId: string
  product: FavoriteProduct
  createdAt: string
}

// ============================================
// Category Labels
// ============================================
const categoryLabels: Record<string, string> = {
  'perdeler': 'Perdeler',
  'tekstiller': 'Tekstiller',
  'yatak-odasi': 'Yatak Odası',
  'aksesuarlar': 'Aksesuarlar',
}

// ============================================
// Favorites Page
// ============================================
export default function FavoritesPage() {
  const { content: managedPage } = usePageContent('favoriler')

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { favorites, isLoading, removeFromFavorites } = useFavorites()
  const router = useRouter()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency}'den başlayan`
  }

  const handleRemoveFavorite = async (productId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    await removeFromFavorites(productId)
  }

  const navLinks = [
    { href: '/', label: 'Ana Sayfa' },
    { href: '/#felsefe', label: 'Felsefemiz' },
    { href: '/#koleksiyon', label: 'Koleksiyon' },
    { href: '/galeri', label: 'Galeri' },
  ]

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
            : 'bg-background/80'
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
                  className={`text-sm tracking-wide transition-all duration-500 relative ${
                    link.href === '/favoriler'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              <a
                href="/#iletisim"
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </a>
            </div>

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

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Favorilerim
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-tight">
                Beğendiğiniz <span className="font-normal italic">Ürünler</span>
              </h1>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
                Kalbinizi kazanan ürünleri burada bulabilirsiniz.
              </p>
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground"></div>
              </div>
            )}

            {/* Empty State */}
            {!isLoading && favorites.length === 0 && (
              <div className="text-center py-16">
                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-sand-100 flex items-center justify-center">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="w-10 h-10 text-muted-foreground/40"
                  >
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-light text-foreground mb-4">
                  Henüz favori ürününüz yok
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Beğendiğiniz ürünleri kalp ikonuna tıklayarak favorilere ekleyebilirsiniz.
                </p>
                <Link
                  href="/galeri"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-xl"
                >
                  Galeriyi Keşfet
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="w-4 h-4"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}

            {/* Favorites Grid */}
            {!isLoading && favorites.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {favorites.map((favorite: Favorite) => (
                  <article
                    key={favorite.id}
                    className="group relative"
                  >
                    <Link
                      href={`/urun/${favorite.product.slug}`}
                      className="block"
                    >
                      <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100 mb-5">
                        {favorite.product.image ? (
                          <Image
                            src={favorite.product.image}
                            alt={favorite.product.name}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              className="w-12 h-12"
                            >
                              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        
                        {/* Category Badge */}
                        <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                          {categoryLabels[favorite.product.category] || favorite.product.category}
                        </span>

                        {/* In Stock Badge */}
                        {favorite.product.inStock && (
                          <span className="absolute top-4 right-4 px-3 py-1 bg-sage-100 text-xs tracking-wide rounded-full text-sage-400 font-medium">
                            Stokta
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-medium text-foreground mb-1 group-hover:text-muted-foreground transition-colors duration-300">
                        {favorite.product.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {favorite.product.description}
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {formatPrice(favorite.product.price, favorite.product.currency)}
                      </p>
                    </Link>

                    {/* Remove from favorites button */}
                    <button
                      onClick={(e) => handleRemoveFavorite(favorite.productId, e)}
                      className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-110 z-10"
                      aria-label="Favorilerden çıkar"
                      style={{ right: favorite.product.inStock ? '4rem' : '1rem', top: '4rem' }}
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5 text-red-500"
                      >
                        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

// ============================================
// Footer Component
// ============================================
function Footer() {
  const { contact } = useSiteSettings()
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
                <span>{contact.email}</span>
              </li>
              <li className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{contact.phoneDisplay}</span>
              </li>
              <li className="flex items-start gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 mt-0.5">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{contact.address}</span>
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
          <SocialMediaButtons variant="light" size="sm" />
        </div>
      </div>
    </footer>
  )
}

