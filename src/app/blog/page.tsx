'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import ManagedPage from '@/components/ManagedPage'
import ManagedPageLoading from '@/components/ManagedPageLoading'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

// ============================================
// Types
// ============================================
interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  image: string | null
  author: string | null
  tags: string[]
  featured: boolean
  viewCount: number
  publishedAt: string | null
  createdAt: string
}

interface BlogResponse {
  success: boolean
  data: BlogPost[]
  pagination: {
    total: number
    limit: number
    offset: number
  }
}

// ============================================
// Blog Listing Page
// ============================================
export default function BlogPage() {
  const { content: managedPage, loading } = usePageContent('blog')

  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('tumu')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const categories = [
    { id: 'tumu', label: 'Tümü' },
    { id: 'dekorasyon', label: 'Dekorasyon' },
    { id: 'trendler', label: 'Trendler' },
    { id: 'ipuclari', label: 'İpuçları' },
  ]

  const categoryLabels: Record<string, string> = {
    'dekorasyon': 'Dekorasyon',
    'trendler': 'Trendler',
    'ipuclari': 'İpuçları',
  }

  const postsPerPage = 6

  // Fetch blogs
  useEffect(() => {
    const fetchBlogs = async () => {
      setIsLoading(true)
      try {
        const offset = (currentPage - 1) * postsPerPage
        let url = `/api/blog?published=true&limit=${postsPerPage}&offset=${offset}`
        if (activeCategory !== 'tumu') {
          url += `&category=${activeCategory}`
        }
        const res = await fetch(url)
        const data: BlogResponse = await res.json()
        if (data.success) {
          setBlogs(data.data)
          setTotalPages(Math.ceil(data.pagination.total / postsPerPage))
        }
      } catch (error) {
        console.error('Error fetching blogs:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlogs()
  }, [activeCategory, currentPage])

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Intersection Observer
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.1, rootMargin: '-50px' }
    )

    document.querySelectorAll('section').forEach((section) => {
      observerRef.current?.observe(section)
    })

    return () => observerRef.current?.disconnect()
  }, [blogs])

  // Featured posts (first 2 featured)
  const featuredPosts = blogs.filter((b) => b.featured).slice(0, 2)
  const regularPosts = blogs.filter((b) => !b.featured)

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  if (loading && !managedPage) {
    return <ManagedPageLoading />
  }

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
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/galeri"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Galeri
              </Link>
              <Link
                href="/blog"
                className="text-sm text-foreground font-medium"
              >
                Blog
              </Link>
            </div>

            {/* CTA Button */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/#iletisim"
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </Link>
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
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/galeri"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-muted-foreground hover:text-foreground transition-colors duration-300 py-2"
              >
                Galeri
              </Link>
              <Link
                href="/blog"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-foreground font-medium py-2"
              >
                Blog
              </Link>
              <Link
                href="/#iletisim"
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-foreground text-background text-center text-sm tracking-wide rounded-full"
              >
                Bize Ulaşın
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-20">
        {/* Hero Section */}
        <section className="py-16 md:py-24 bg-sand-50 relative overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-wood-100/50 blur-3xl" />
          <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-sage-100/50 blur-3xl" />

          <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
            <div className="text-center max-w-3xl mx-auto">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
                Blog
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
                İlham ve <span className="font-normal italic">Yaşam</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
                Ev dekorasyonu, trendler ve yaşam tarzı hakkında ilham verici yazılar.
                Japandi felsefesini yaşam alanlarınıza taşıyın.
              </p>
            </div>
          </div>
        </section>

        {/* Category Tabs */}
        <section className="py-8 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 md:gap-4 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveCategory(cat.id)
                    setCurrentPage(1)
                  }}
                  className={`px-4 md:px-6 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-300 ${
                    activeCategory === cat.id
                      ? 'bg-foreground text-background'
                      : 'bg-sand-100 text-muted-foreground hover:bg-sand-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && activeCategory === 'tumu' && (
          <section className="py-12 md:py-16 bg-background">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-8 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
                Öne Çıkan
              </h2>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {featuredPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group relative rounded-2xl overflow-hidden aspect-[16/10] opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 1} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
                  >
                    <Image
                      src={post.image || '/images/hero.png'}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                      {post.category && (
                        <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full mb-3">
                          {categoryLabels[post.category] || post.category}
                        </span>
                      )}
                      <h3 className="text-xl md:text-2xl font-medium text-white mb-2 group-hover:underline decoration-white/50 underline-offset-4">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-white/80 text-sm md:text-base line-clamp-2">
                          {post.excerpt}
                        </p>
                      )}
                      <p className="text-white/60 text-sm mt-3">
                        {formatDate(post.publishedAt)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog Grid */}
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  Bu kategoride henüz blog yazısı bulunmuyor.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                {(activeCategory === 'tumu' ? regularPosts : blogs).map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group cursor-pointer opacity-0 translate-y-8 animate-fade-in-up stagger-${(index % 3) + 1} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-sand-100 mb-5">
                      <Image
                        src={post.image || '/images/product-curtain.png'}
                        alt={post.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      {post.category && (
                        <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                          {categoryLabels[post.category] || post.category}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-muted-foreground transition-colors duration-300 line-clamp-2">
                      {post.title}
                    </h3>
                    {post.excerpt && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {post.excerpt}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatDate(post.publishedAt)}</span>
                      {post.author && (
                        <>
                          <span>•</span>
                          <span>{post.author}</span>
                        </>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sand-100"
                >
                  Önceki
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg text-sm transition-colors ${
                        currentPage === page
                          ? 'bg-foreground text-background'
                          : 'border border-border hover:bg-sand-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:bg-sand-100"
                >
                  Sonraki
                </button>
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
  const { legal } = useSiteSettings()
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-page' }),
      })
      const data = await res.json()
      if (data.success) {
        setSubscribeStatus('success')
        setEmail('')
      } else {
        setSubscribeStatus('error')
      }
    } catch {
      setSubscribeStatus('error')
    }
  }

  return (
    <footer className="bg-foreground text-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-light mb-4">
              ÖzTelevi <span className="font-normal italic">Ev Tekstili</span>
            </h3>
            <p className="text-background/70 leading-relaxed mb-6">
              Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan,
              el işçiliği tekstiller ve perdeler. Her parça, yaşam alanınıza huzur
              davetiyesidir.
            </p>
            <SocialMediaButtons variant="light" size="sm" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm tracking-wider uppercase mb-4">Hızlı Bağlantılar</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-background/70 hover:text-background transition-colors">
                  Ana Sayfa
                </Link>
              </li>
              <li>
                <Link href="/galeri" className="text-background/70 hover:text-background transition-colors">
                  Galeri
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-background/70 hover:text-background transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/#iletisim" className="text-background/70 hover:text-background transition-colors">
                  İletişim
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm tracking-wider uppercase mb-4">Bülten</h4>
            <p className="text-background/70 text-sm mb-4">
              Yeni koleksiyonlar ve özel tekliflerden haberdar olun.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="E-posta adresiniz"
                required
                className="px-4 py-2 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 text-sm focus:outline-none focus:border-background/40"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-background text-foreground text-sm rounded-lg transition-colors hover:bg-background/90"
              >
                Abone Ol
              </button>
              {subscribeStatus === 'success' && (
                <p className="text-sm text-green-400">Başarıyla abone oldunuz!</p>
              )}
              {subscribeStatus === 'error' && (
                <p className="text-sm text-red-400">Bir hata oluştu. Lütfen tekrar deneyin.</p>
              )}
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-background/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            © {new Date().getFullYear()} ÖzTelevi. Tüm hakları saklıdır.
          </p>
          <div className="flex gap-6 text-sm text-background/50">
            <Link href={legal.privacy} className="hover:text-background transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href={legal.terms} className="hover:text-background transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

