'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo, OzTeleviLogoLight } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import { SearchBar, SearchTrigger } from '@/components/SearchBar'
import { useFavorites } from '@/contexts/FavoritesContext'
import { useCart } from '@/contexts/CartContext'
import { CartIcon } from '@/components/CartIcon'
import { CartDrawer } from '@/components/CartDrawer'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import type { HomePageContent } from '@/lib/home-page-content'

// ============================================
// ÖzTelevi - Ev Tekstili ve Perdeleri
// Japandi Tasarım: Japon minimalizmi × İskandinav sıcaklığı
// ============================================

export default function HomePageClient({ content }: { content: HomePageContent }) {
  const [isLoaded] = useState(true)
  const [activeSection, setActiveSection] = useState('')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    // Intersection Observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
            entry.target.classList.add('in-view')
          }
        })
      },
      { threshold: 0.2, rootMargin: '-50px' }
    )

    document.querySelectorAll('section').forEach((section) => {
      observerRef.current?.observe(section)
    })

    return () => observerRef.current?.disconnect()
  }, [])

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <Navigation activeSection={activeSection} onSearchClick={() => setIsSearchOpen(true)} />
      
      {/* Search Modal */}
      <SearchBar isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      
      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection isLoaded={isLoaded} content={content.hero} />

        {/* Visualizer Banner */}
        <VisualizerBanner content={content.visualizer} />
        
        {/* Philosophy Section */}
        <PhilosophySection content={content.philosophy} />
        
        {/* Products Section */}
        <ProductsSection content={content.products} />
        
        {/* Craftsmanship Section */}
        <CraftsmanshipSection content={content.craftsmanship} />
        
        {/* Living Spaces Section */}
        <LivingSpacesSection content={content.livingSpaces} quote={content.testimonials} />
        
        {/* Testimonials Section */}
        <TestimonialsSection content={content.testimonials} />
        
        {/* CTA Section */}
        <CTASection content={content.contact} />
      </main>
      
      {/* Footer */}
      <Footer content={content.footer} />
      
      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}

// ============================================
// Navigation Component
// ============================================
function Navigation({ activeSection, onSearchClick }: { activeSection: string; onSearchClick: () => void }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { favorites } = useFavorites()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/koleksiyonlar', label: 'Koleksiyonlar' },
    { href: '/galeri', label: 'Galeri' },
    { href: '/blog', label: 'Blog' },
    { href: '/sikca-sorulan-sorular', label: 'SSS' },
  ]

  const sectionLinks = [
    { href: '#felsefe', label: 'Felsefemiz' },
    { href: '#koleksiyon', label: 'Koleksiyon' },
    { href: '#zanaat', label: 'Zanaat' },
    { href: '#mekanlar', label: 'Mekanlar' },
  ]

  const isActiveSectionLink = (href: string) =>
    href.startsWith('#') && activeSection === href.slice(1)

  const getSectionChipClasses = (href: string) =>
    `group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-[11px] tracking-[0.22em] uppercase whitespace-nowrap transition-all duration-300 ${
      isActiveSectionLink(href)
        ? 'border-foreground bg-foreground text-background shadow-[0_10px_30px_rgba(41,37,36,0.18)]'
        : 'border-border/50 bg-background/80 text-muted-foreground hover:border-foreground/30 hover:bg-background hover:text-foreground'
    }`

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        isScrolled
          ? 'bg-background/95 backdrop-blur-md shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <OzTeleviLogo />

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* CTA Button & Icons */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Search */}
            <SearchTrigger onClick={onSearchClick} />
            
            {/* Favorites */}
            <Link
              href="/favoriler"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors duration-300"
              aria-label="Favoriler"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-wood-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            
            {/* Cart */}
            <CartIcon />
            
            {/* 3D Visualizer */}
            <Link
              href="/visualizer"
              className="px-4 py-2 text-sm tracking-wide text-foreground border border-foreground/30 rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              3D
            </Link>

            <Link
              href="/giris"
              className="px-4 py-2 text-sm tracking-wide text-foreground border border-foreground/30 rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5"
            >
              Giriş
            </Link>
            
            <a
              href="#iletisim"
              className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
            >
              Bize Ulaşın
            </a>
          </div>

          {/* Mobile Icons & Menu Button */}
          <div className="flex lg:hidden items-center gap-1">
            {/* Mobile Search */}
            <button
              onClick={onSearchClick}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
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
            
            {/* Mobile Favorites */}
            <Link
              href="/favoriler"
              className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Favoriler"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-5 h-5"
              >
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-wood-500 text-white text-xs rounded-full flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </Link>
            
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

        <div className="hidden lg:block border-t border-border/40 pb-4 pt-3">
          <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-full border border-border/50 bg-background/70 px-4 py-2 shadow-[0_12px_40px_rgba(120,113,108,0.12)] backdrop-blur-xl">
            <span className="shrink-0 text-[11px] tracking-[0.24em] uppercase text-muted-foreground">
              Anasayfa Bölümleri
            </span>
            <div className="flex-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex min-w-max items-center gap-2 pr-1">
                {sectionLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className={getSectionChipClasses(link.href)}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActiveSectionLink(link.href)
                          ? 'bg-background'
                          : 'bg-wood-400 group-hover:bg-foreground'
                      }`}
                    />
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md border-t border-border/50 ${
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
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">
                Anasayfa Bölümleri
              </p>
              <div className="overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2">
                {sectionLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={getSectionChipClasses(link.href)}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        isActiveSectionLink(link.href)
                          ? 'bg-background'
                          : 'bg-wood-400'
                      }`}
                    />
                    {link.label}
                  </a>
                ))}
                </div>
              </div>
            </div>
            <Link
              href="/giris"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2"
            >
              Giriş Yap
            </Link>
            <Link
              href="/visualizer"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-foreground font-medium py-2 flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              3D Görselleştirici
            </Link>
            <a
              href="#iletisim"
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
// Visualizer Banner
// ============================================
function VisualizerBanner({ content }: { content: HomePageContent['visualizer'] }) {
  return (
    <section className="relative py-16 md:py-20 bg-gradient-to-r from-wood-100 via-sand-100 to-sage-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          {/* Content */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-foreground/10 rounded-full text-sm text-foreground mb-4">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
                <path d="M3.27 6.96L12 12.01l8.73-5.05M12 22.08V12" />
              </svg>
              {content.badge}
            </div>
            <h2 className="text-2xl md:text-3xl font-light text-foreground mb-3">
              {content.title}
            </h2>
            <p className="text-muted-foreground mb-6 max-w-lg">
              {content.description}
            </p>
            <Link
              href={content.ctaLink}
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {content.ctaText}
            </Link>
          </div>

          {/* Preview Cards */}
          <div className="flex-1 relative">
            <div className="flex gap-4 justify-center md:justify-end">
              {/* Room Preview 1 */}
              <div className="relative w-32 h-40 md:w-40 md:h-52 rounded-2xl overflow-hidden shadow-xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                <Image
                  src="/images/scene-bedroom.png"
                  alt="Yatak Odası"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs text-white font-medium">Yatak Odası</span>
              </div>
              {/* Room Preview 2 */}
              <div className="relative w-32 h-40 md:w-40 md:h-52 rounded-2xl overflow-hidden shadow-xl transform -rotate-3 hover:rotate-0 transition-transform duration-500 -mt-8">
                <Image
                  src="/images/hero.png"
                  alt="Salon"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-2 left-2 text-xs text-white font-medium">Salon</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// Hero Section
// ============================================
function HeroSection({
  isLoaded,
  content,
}: {
  isLoaded: boolean
  content: HomePageContent['hero']
}) {
  const titleLines = content.title
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={content.image}
          alt="Güneş ışığıyla dolu salon, akan keten perdeler"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/30 to-background/90" />
      </div>

      {/* Floating Elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-wood-200/30 blur-3xl animate-breathe" />
      <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-sage-200/30 blur-3xl animate-breathe stagger-2" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <div
          className={`transition-all duration-1000 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <p className="text-sm tracking-[0.3em] uppercase text-foreground/70 mb-6 font-medium">
            {content.eyebrow}
          </p>
        </div>

        <h1
          className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-light leading-tight text-foreground mb-8 transition-all duration-1000 delay-200 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {titleLines.length > 1 ? (
            <>
              {titleLines[0]}
              <br />
              <span className="font-normal italic">{titleLines.slice(1).join(' ')}</span>
            </>
          ) : (
            content.title
          )}
        </h1>

        <p
          className={`max-w-2xl mx-auto text-lg text-foreground/80 leading-relaxed mb-12 transition-all duration-1000 delay-400 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {content.subtitle}
        </p>

        <div
          className={`flex flex-col sm:flex-row items-center justify-center gap-4 transition-all duration-1000 delay-600 ${
            isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <a
            href={content.primaryCtaLink}
            className="px-8 py-4 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-xl hover:-translate-y-0.5"
          >
            {content.primaryCtaText}
          </a>
          <a
            href={content.secondaryCtaLink}
            className="px-8 py-4 border border-foreground/30 text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5"
          >
            {content.secondaryCtaText}
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 transition-all duration-1000 delay-1000 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex flex-col items-center gap-3 text-foreground/60">
          <span className="text-xs tracking-widest uppercase">Kaydır</span>
          <div className="w-px h-12 bg-gradient-to-b from-foreground/50 to-transparent animate-float-gentle" />
        </div>
      </div>
    </section>
  )
}

// ============================================
// Philosophy Section
// ============================================
function PhilosophySection({ content }: { content: HomePageContent['philosophy'] }) {
  return (
    <section
      id="felsefe"
      className="py-24 md:py-32 lg:py-40 bg-background relative overflow-hidden"
    >
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

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.description}
          </p>
        </div>

        {/* Principles Grid */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {content.principles.map((principle, index) => (
            <div
              key={`${principle.title}-${index}`}
              className={`group p-8 lg:p-10 rounded-2xl bg-card border border-border/50 transition-all duration-700 hover:border-border hover:shadow-lg opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 3} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
            >
              <span className="text-4xl font-light text-muted-foreground/40 group-hover:text-muted-foreground/60 transition-colors duration-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="text-xl font-medium text-foreground mt-4 mb-3">
                {principle.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {principle.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// Products Section
// ============================================

interface Product {
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

function isProductList(value: unknown): value is Product[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as Product).id === 'string' &&
        typeof (item as Product).name === 'string' &&
        typeof (item as Product).slug === 'string'
    )
  )
}

// Fallback ürünler (API'den veri gelmezse veya veritabanı boşsa)
const fallbackProducts = [
  {
    name: 'Aira Keten Perdeler',
    description: 'Doğal drapeli, ışık süzen Belçika keteni',
    price: '280.000 ₺\'den başlayan',
    image: '/images/product-curtain.png',
    category: 'Perdeler',
    slug: 'aira-keten-perdeler',
  },
  {
    name: 'Moku Organik Atkılar',
    description: 'Toprak tonlarında el dokuma pamuk atkılar',
    price: '145.000 ₺\'den başlayan',
    image: '/images/product-textile.png',
    category: 'Tekstiller',
    slug: 'moku-organik-atkilar',
  },
  {
    name: 'Sora Tül Paneller',
    description: 'Yumuşak ışık için zarif yarı şeffaf perdeler',
    price: '195.000 ₺\'den başlayan',
    image: '/images/hero.png',
    category: 'Perdeler',
    slug: 'sora-tul-paneller',
  },
  {
    name: 'Nami Yatak Takımı',
    description: 'Doğal tonlarda %100 organik keten yatak örtüsü',
    price: '320.000 ₺\'den başlayan',
    image: '/images/scene-bedroom.png',
    category: 'Yatak Odası',
    slug: 'nami-yatak-takimi',
  },
]

const categoryLabels: Record<string, string> = {
  'perdeler': 'Perdeler',
  'tekstiller': 'Tekstiller',
  'yatak-odasi': 'Yatak Odası',
  'aksesuarlar': 'Aksesuarlar',
}

function ProductsSection({ content }: { content: HomePageContent['products'] }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [useFallback, setUseFallback] = useState(false)
  const { addItem, openDrawer } = useCart()
  const [addingProductId, setAddingProductId] = useState<string | null>(null)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products?limit=4')
        const data = await res.json()
        if (data.success && isProductList(data.data) && data.data.length > 0) {
          setProducts(data.data)
        } else {
          // Veritabanında ürün yok, fallback kullan
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

  const formatPrice = (price: number, currency: string) => {
    const formatted = price.toLocaleString('tr-TR')
    return `${formatted} ${currency}'den başlayan`
  }

  return (
    <section
      id="koleksiyon"
      className="py-24 md:py-32 lg:py-40 bg-sand-50 relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.description}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
          </div>
        )}

        {/* Products Grid - Dynamic from API */}
        {!isLoading && !useFallback && products.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product, index) => (
              <div
                key={product.id}
                className={`group cursor-pointer opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 3} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
              >
                <Link href={`/urun/${product.slug}`}>
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100 mb-5">
                    <Image
                      src={product.image || '/images/product-curtain.png'}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                      {categoryLabels[product.category] || product.category}
                    </span>
                    
                    {/* Sepete Ekle Butonu - Hover'da görünür */}
                    <button
                      onClick={async (e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setAddingProductId(product.id)
                        await addItem(product.id, 1)
                        setTimeout(() => {
                          setAddingProductId(null)
                          openDrawer()
                        }, 500)
                      }}
                      disabled={addingProductId === product.id || !product.inStock}
                      className={`absolute bottom-4 right-4 p-3 rounded-full transition-all duration-300 ${
                        addingProductId === product.id
                          ? 'bg-sage-400 text-white scale-110'
                          : 'bg-background/90 backdrop-blur-sm text-foreground hover:bg-foreground hover:text-background opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0'
                      } disabled:opacity-50`}
                      aria-label="Sepete Ekle"
                    >
                      {addingProductId === product.id ? (
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
                  </div>
                </Link>
                <Link href={`/urun/${product.slug}`}>
                  <h3 className="text-lg font-medium text-foreground mb-1 group-hover:text-muted-foreground transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {formatPrice(product.price, product.currency)}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Products Grid - Fallback (static) */}
        {!isLoading && useFallback && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {fallbackProducts.map((product, index) => (
              <div
                key={product.name}
                className={`group cursor-pointer opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 3} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
              >
                <Link href={`/urun/${product.slug}`}>
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-sand-100 mb-5">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="absolute top-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-sm text-xs tracking-wide rounded-full text-foreground font-medium">
                      {product.category}
                    </span>
                  </div>
                </Link>
                <Link href={`/urun/${product.slug}`}>
                  <h3 className="text-lg font-medium text-foreground mb-1 group-hover:text-muted-foreground transition-colors duration-300">
                    {product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {product.description}
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {product.price}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* View All CTA */}
        <div className="text-center mt-16 opacity-0 translate-y-8 animate-fade-in-up stagger-7 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
          <a
            href="/galeri"
            className="inline-flex items-center gap-3 px-8 py-4 border border-foreground/30 text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5 group"
          >
            Tüm Ürünleri Gör
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  )
}

// ============================================
// Craftsmanship Section
// ============================================
function CraftsmanshipSection({ content }: { content: HomePageContent['craftsmanship'] }) {
  const featureIcons = [
    (
      <svg key="craft-icon-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    (
      <svg key="craft-icon-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    (
      <svg key="craft-icon-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    (
      <svg key="craft-icon-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M4.93 19.07A10 10 0 1119.07 4.93M9 12l2 2 4-4" />
      </svg>
    ),
  ]

  return (
    <section
      id="zanaat"
      className="py-24 md:py-32 lg:py-40 bg-wood-50 relative overflow-hidden"
    >
      {/* Decorative Element */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-wood-100/50 to-transparent rounded-bl-[200px]" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left Content */}
          <div>
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.title}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8 opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.description}
            </p>
            <div className="opacity-0 translate-y-8 animate-fade-in-up stagger-3 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              <a
                href={content.linkHref}
                className="inline-flex items-center gap-3 text-foreground text-sm tracking-wide font-medium group"
              >
                {content.linkText}
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          </div>

          {/* Right Content - Features */}
          <div className="grid sm:grid-cols-2 gap-6">
            {content.features.map((feature, index) => (
              <div
                key={feature.title}
                className={`p-6 rounded-2xl bg-background/90 backdrop-blur-sm border border-border/50 transition-all duration-500 hover:border-border hover:shadow-md opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 4} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
              >
                <div className="w-10 h-10 rounded-full bg-wood-100 flex items-center justify-center mb-4">
                  <div className="w-5 h-5 text-wood-600">{featureIcons[index % featureIcons.length]}</div>
                </div>
                <h3 className="text-base font-medium text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// Living Spaces Section
// ============================================
function LivingSpacesSection({
  content,
  quote,
}: {
  content: HomePageContent['livingSpaces']
  quote: Pick<HomePageContent['testimonials'], 'featuredQuoteText' | 'featuredQuoteAttribution'>
}) {
  return (
    <section
      id="mekanlar"
      className="py-24 md:py-32 lg:py-40 bg-background relative"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.description}
          </p>
        </div>

        {/* Image Gallery */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden opacity-0 translate-y-8 animate-fade-in-up stagger-3 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            <Image
              src={content.images[0] || '/images/hero.png'}
              alt="Akan perdelerle güneşli salon"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-xl font-medium text-white mb-1">
                Salon
              </h3>
              <p className="text-white/80 text-sm">
                Günlük huzur için ışık süzen perdeler
              </p>
            </div>
          </div>

          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden opacity-0 translate-y-8 animate-fade-in-up stagger-4 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            <Image
              src={content.images[1] || content.images[0] || '/images/scene-bedroom.png'}
              alt="Doğal tekstillerle huzurlu yatak odası"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <h3 className="text-xl font-medium text-white mb-1">
                Yatak Odası
              </h3>
              <p className="text-white/80 text-sm">
                Huzurlu uyku için organik ketenler
              </p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <blockquote className="max-w-3xl mx-auto mt-16 md:mt-24 text-center opacity-0 translate-y-8 animate-fade-in-up stagger-5 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
          <p className="text-2xl md:text-3xl font-light text-foreground leading-relaxed italic">
            &ldquo;{quote.featuredQuoteText}&rdquo;
          </p>
          <footer className="mt-6 text-muted-foreground">
            <span className="text-sm">— {quote.featuredQuoteAttribution}</span>
          </footer>
        </blockquote>
      </div>
    </section>
  )
}

// ============================================
// Testimonials Section
// ============================================
function TestimonialsSection({ content }: { content: HomePageContent['testimonials'] }) {
  return (
    <section className="py-24 md:py-32 lg:py-40 bg-sage-50 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 -left-24 w-64 h-64 rounded-full bg-sage-100/50 blur-3xl" />
      <div className="absolute bottom-1/4 -right-24 w-64 h-64 rounded-full bg-wood-100/50 blur-3xl" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.eyebrow}
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.title}
          </h2>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            {content.description}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {content.items.map((testimonial, index) => (
            <div
              key={testimonial.author}
              className={`p-8 rounded-2xl bg-background border border-border/50 transition-all duration-500 hover:shadow-lg opacity-0 translate-y-8 animate-fade-in-up stagger-${index + 2} in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000`}
            >
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-4 h-4 text-wood-400"
                  >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-foreground leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>
              <footer>
                <p className="font-medium text-foreground">
                  {testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {testimonial.location}
                </p>
              </footer>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================
// CTA Section
// ============================================
function CTASection({ content }: { content: HomePageContent['contact'] }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          subject: 'İletişim Formu',
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setFormData({ name: '', email: '', phone: '', message: '' })
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
    <section
      id="iletisim"
      className="py-24 md:py-32 lg:py-40 bg-foreground relative overflow-hidden"
    >
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div>
            <p className="text-sm tracking-[0.3em] uppercase text-background/70 mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.eyebrow}
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-light text-background leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.title}
            </h2>
            <p className="text-lg text-background/80 leading-relaxed mb-8 opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {content.description}
            </p>

            {/* Contact Info */}
            <div className="space-y-4 opacity-0 translate-y-8 animate-fade-in-up stagger-3 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              <div className="flex items-center gap-3 text-background/80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{content.details.email}</span>
              </div>
              <div className="flex items-center gap-3 text-background/80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>{content.details.phone}</span>
              </div>
              <div className="flex items-center gap-3 text-background/80">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
                  <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{content.details.address}</span>
              </div>
            </div>
          </div>

          {/* Right Content - Contact Form */}
          <div className="bg-background/5 backdrop-blur-sm rounded-2xl p-8 border border-background/10 opacity-0 translate-y-8 animate-fade-in-up stagger-4 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
            <h3 className="text-xl font-medium text-background mb-6">Bize Ulaşın</h3>
            
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm text-background/70 mb-2">
                  Adınız Soyadınız *
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors"
                  placeholder="Adınızı giriniz"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="email" className="block text-sm text-background/70 mb-2">
                    E-posta *
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors"
                    placeholder="ornek@email.com"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm text-background/70 mb-2">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors"
                    placeholder="+90 5XX XXX XX XX"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm text-background/70 mb-2">
                  Mesajınız *
                </label>
                <textarea
                  id="message"
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 bg-background/10 border border-background/20 rounded-lg text-background placeholder-background/50 focus:outline-none focus:border-background/40 transition-colors resize-none"
                  placeholder="Nasıl yardımcı olabiliriz?"
                />
              </div>

              {submitStatus === 'success' && (
                <div className="p-4 bg-green-500/20 border border-green-500/30 rounded-lg text-green-200 text-sm">
                  Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.
                </div>
              )}

              {submitStatus === 'error' && (
                <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-200 text-sm">
                  Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full px-6 py-4 bg-background text-foreground text-sm tracking-wide rounded-lg font-medium transition-all duration-500 hover:bg-background/90 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Gönderiliyor...' : 'Mesaj Gönder'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================
// Footer Component
// ============================================
function Footer({ content }: { content: HomePageContent['footer'] }) {
  const { legal } = useSiteSettings()
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
        body: JSON.stringify({ email, source: 'footer' }),
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
    <footer className="bg-background border-t border-border py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12 md:gap-8 mb-12">
          {/* Brand & Newsletter */}
          <div className="md:col-span-1">
            <OzTeleviLogo className="mb-6" />
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              Japon minimalizmi ve İskandinav sıcaklığından ilham alan
              ev tekstilleri ve perdeleri.
            </p>

            {/* Social Media Buttons */}
            <SocialMediaButtons variant="default" size="sm" direction="horizontal" />

            {/* Newsletter Form */}
            <div className="mt-4">
              <h4 className="text-sm font-medium text-foreground mb-3">
                Bültenimize Abone Olun
              </h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="E-posta adresiniz"
                    className="flex-1 px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors text-sm"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2.5 bg-foreground text-background text-sm rounded-lg font-medium transition-all duration-300 hover:bg-foreground/90 disabled:opacity-50"
                  >
                    {isSubmitting ? '...' : 'Abone'}
                  </button>
                </div>
                {submitStatus === 'success' && (
                  <p className="text-xs text-green-600">Başarıyla abone oldunuz!</p>
                )}
                {submitStatus === 'error' && (
                  <p className="text-xs text-red-500">Bir hata oluştu. Lütfen tekrar deneyin.</p>
                )}
              </form>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Koleksiyon
            </h4>
            <ul className="space-y-3">
              {content.collectionLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Şirket
            </h4>
            <ul className="space-y-3">
              {content.companyLinks.map(
                (item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                    >
                      {item.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4">
              Destek
            </h4>
            <ul className="space-y-3">
              {content.supportLinks.map((item) => (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © 2024 ÖzTelevi. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-6">
            {[
              { label: 'Gizlilik', href: legal.privacy },
              { label: 'Kullanım Şartları', href: legal.terms },
              { label: 'Çerezler', href: legal.cookies },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-300"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

