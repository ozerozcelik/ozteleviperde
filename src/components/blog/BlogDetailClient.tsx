'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import { sanitizeRichHtml } from '@/lib/content-sanitizer'

// ============================================
// Types
// ============================================
export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
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

export interface RelatedPost {
  id: string
  title: string
  slug: string
  image: string | null
  category: string | null
  publishedAt: string | null
}

// ============================================
// Blog Detail Page
// ============================================
export default function BlogDetailClient({
  slug,
  initialBlog,
  initialRelatedPosts = [],
}: {
  slug: string
  initialBlog: BlogPost | null
  initialRelatedPosts?: RelatedPost[]
}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [blog, setBlog] = useState<BlogPost | null>(initialBlog)
  const [relatedPosts, setRelatedPosts] = useState<RelatedPost[]>(initialRelatedPosts)
  const [isLoading, setIsLoading] = useState(!initialBlog)
  const [error, setError] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const categoryLabels: Record<string, string> = {
    'dekorasyon': 'Dekorasyon',
    'trendler': 'Trendler',
    'ipuclari': 'İpuçları',
  }

  // Fetch blog post
  useEffect(() => {
    if (initialBlog) {
      setBlog(initialBlog)
      setRelatedPosts(initialRelatedPosts)
      setIsLoading(false)
      setError(null)
      return
    }

    const fetchBlog = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/blog/${slug}`)
        const data = await res.json()
        if (data.success) {
          setBlog(data.data)
          // Fetch related posts
          if (data.data.category) {
            const relatedRes = await fetch(
              `/api/blog?category=${data.data.category}&limit=3&offset=0`
            )
            const relatedData = await relatedRes.json()
            if (relatedData.success) {
              setRelatedPosts(
                relatedData.data
                  .filter((p: BlogPost) => p.id !== data.data.id)
                  .slice(0, 2)
              )
            }
          }
        } else {
          setError('Blog yazısı bulunamadı.')
        }
      } catch (err) {
        console.error('Error fetching blog:', err)
        setError('Blog yazısı yüklenirken bir hata oluştu.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchBlog()
  }, [initialBlog, initialRelatedPosts, slug])

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
  }, [blog])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = blog?.title || ''

  const handleShare = async (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl)
    const encodedTitle = encodeURIComponent(shareTitle)

    const shareLinks: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=${encodedTitle}`,
      whatsapp: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
    }

    if (shareLinks[platform]) {
      window.open(shareLinks[platform], '_blank', 'width=600,height=400')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-light text-foreground mb-4">
            {error || 'Blog yazısı bulunamadı'}
          </h1>
          <Link
            href="/blog"
            className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90"
          >
            Blog&apos;a Dön
          </Link>
        </div>
      </div>
    )
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
        {/* Hero Image */}
        <section className="relative aspect-[16/9] md:aspect-[21/9] overflow-hidden">
          <Image
            src={blog.image || '/images/hero.png'}
            alt={blog.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-foreground/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 lg:p-16">
            <div className="max-w-4xl">
              {blog.category && (
                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs rounded-full mb-4">
                  {categoryLabels[blog.category] || blog.category}
                </span>
              )}
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-light text-white leading-tight mb-4">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
                {blog.author && (
                  <span className="flex items-center gap-2">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {blog.author}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  {formatDate(blog.publishedAt)}
                </span>
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {blog.viewCount} görüntülenme
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Article Content */}
        <section className="py-12 md:py-16 bg-background">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <article
              className="prose prose-lg prose-sand max-w-none
                prose-headings:font-light prose-headings:text-foreground
                prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-muted-foreground prose-p:leading-relaxed
                prose-a:text-wood-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-foreground
                prose-blockquote:border-l-wood-400 prose-blockquote:bg-sand-50 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                prose-img:rounded-2xl prose-img:shadow-lg
                prose-ul:text-muted-foreground prose-ol:text-muted-foreground"
              dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(blog.content) }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-border">
                <h4 className="text-sm text-muted-foreground mb-4">Etiketler</h4>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-4 py-1.5 bg-sand-100 text-muted-foreground text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="mt-12 pt-8 border-t border-border">
              <h4 className="text-sm text-muted-foreground mb-4">Bu yazıyı paylaş</h4>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1877F2]">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#1DA1F2]">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#25D366]">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </button>
                <button
                  onClick={() => handleShare('pinterest')}
                  className="flex items-center gap-2 px-4 py-2 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors text-sm"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#E60023]">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
                  </svg>
                  Pinterest
                </button>
              </div>
            </div>

            {/* Author Bio */}
            {blog.author && (
              <div className="mt-12 p-6 bg-sand-50 rounded-2xl flex items-start gap-4">
                <div className="w-16 h-16 rounded-full bg-wood-200 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl font-medium text-wood-700">
                    {blog.author.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-1">{blog.author}</h4>
                  <p className="text-sm text-muted-foreground">
                    ÖzTelevi blog yazarı. Ev dekorasyonu, Japandi tasarım ve sürdürülebilir yaşam hakkında yazılar kaleme alıyor.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="py-12 md:py-16 bg-sand-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
              <h2 className="text-2xl font-light text-foreground mb-8 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
                Benzer <span className="font-normal italic">Yazılar</span>
              </h2>
              <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
                {relatedPosts.map((post, index) => (
                  <Link
                    key={post.id}
                    href={`/blog/${post.slug}`}
                    className={`group cursor-pointer opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 1} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
                  >
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-sand-100 mb-5">
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
                    <h3 className="text-lg font-medium text-foreground mb-2 group-hover:text-muted-foreground transition-colors duration-300">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(post.publishedAt)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
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
  const [email, setEmail] = useState('')
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'blog-detail-page' }),
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
            <Link href="#" className="hover:text-background transition-colors">
              Gizlilik Politikası
            </Link>
            <Link href="#" className="hover:text-background transition-colors">
              Kullanım Şartları
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

