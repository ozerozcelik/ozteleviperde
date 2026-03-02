'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================
// Types
// ============================================
interface SearchResultProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  image: string | null
  inStock: boolean
}

interface SearchResultBlog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category: string | null
  image: string | null
}

interface SearchResults {
  products: SearchResultProduct[]
  blogs: SearchResultBlog[]
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
// Props
// ============================================
interface SearchBarProps {
  isOpen: boolean
  onClose: () => void
}

// ============================================
// Component
// ============================================
export function SearchBar({ isOpen, onClose }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults>({ products: [], blogs: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'blogs'>('all')
  const inputRef = useRef<HTMLInputElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Close on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  // Search function with debounce
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults({ products: [], blogs: [] })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=5`)
      const data = await response.json()

      if (data.success) {
        setResults(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(timer)
  }, [query, performSearch])

  // Handle click outside
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  // Handle product click
  const handleProductClick = (slug: string) => {
    onClose()
    setQuery('')
    router.push(`/urun/${slug}`)
  }

  // Format price
  const formatPrice = (price: number, currency: string) => {
    return `${price.toLocaleString('tr-TR')} ${currency}`
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-foreground/60 backdrop-blur-sm" />

      {/* Modal */}
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl bg-background rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up"
      >
        {/* Search Input */}
        <div className="flex items-center gap-4 p-6 border-b border-border/50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="w-6 h-6 text-muted-foreground flex-shrink-0"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ürün veya blog yazısı ara..."
            className="flex-1 text-lg bg-transparent border-none outline-none text-foreground placeholder-muted-foreground"
          />
          {isLoading && (
            <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
          )}
        </div>

        {/* Tabs */}
        {query.trim() && (
          <div className="flex gap-2 px-6 py-3 border-b border-border/50 bg-sand-50">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-foreground text-background'
                  : 'bg-background border border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              Tümü ({results.products.length + results.blogs.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                activeTab === 'products'
                  ? 'bg-foreground text-background'
                  : 'bg-background border border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              Ürünler ({results.products.length})
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 text-sm rounded-full transition-all duration-300 ${
                activeTab === 'blogs'
                  ? 'bg-foreground text-background'
                  : 'bg-background border border-border text-muted-foreground hover:border-foreground/30'
              }`}
            >
              Blog ({results.blogs.length})
            </button>
          </div>
        )}

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query.trim() && (
            <div className="p-12 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4"
              >
                <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-muted-foreground">Aramak istediğiniz kelimeyi yazın</p>
            </div>
          )}

          {query.trim() && !isLoading && results.products.length === 0 && results.blogs.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-2">Sonuç bulunamadı</p>
              <p className="text-sm text-muted-foreground/70">
                &ldquo;{query}&rdquo; için bir sonuç bulunamadı.
              </p>
            </div>
          )}

          {/* Products Results */}
          {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
            <div className="p-4">
              <p className="text-xs tracking-widest uppercase text-muted-foreground px-2 mb-3">
                Ürünler
              </p>
              <div className="space-y-2">
                {results.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.slug)}
                    className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-sand-100 transition-colors duration-300 text-left group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-100 flex-shrink-0">
                      {product.image ? (
                        <Image
                          src={product.image}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                            <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate group-hover:text-wood-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground truncate">
                        {categoryLabels[product.category] || product.category}
                      </p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {formatPrice(product.price, product.currency)}
                      </p>
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Blog Results */}
          {(activeTab === 'all' || activeTab === 'blogs') && results.blogs.length > 0 && (
            <div className="p-4 border-t border-border/50">
              <p className="text-xs tracking-widest uppercase text-muted-foreground px-2 mb-3">
                Blog
              </p>
              <div className="space-y-2">
                {results.blogs.map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/blog/${blog.slug}`}
                    onClick={onClose}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-sand-100 transition-colors duration-300 group"
                  >
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-100 flex-shrink-0">
                      {blog.image ? (
                        <Image
                          src={blog.image}
                          alt={blog.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                            <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-foreground truncate group-hover:text-wood-600 transition-colors">
                        {blog.title}
                      </h4>
                      {blog.excerpt && (
                        <p className="text-sm text-muted-foreground truncate">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground transition-colors"
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
    </div>
  )
}

// ============================================
// Search Trigger Button
// ============================================
export function SearchTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
      aria-label="Ara"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </button>
  )
}
