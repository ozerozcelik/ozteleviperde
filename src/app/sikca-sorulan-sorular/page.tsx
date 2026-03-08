'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import ManagedPage from '@/components/ManagedPage'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

// ============================================
// Types
// ============================================
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

// ============================================
// Fallback FAQs (when API returns empty)
// ============================================
const fallbackFAQs: FAQ[] = [
  {
    id: '1',
    question: 'Ürünleriniz hangi malzemelerden üretilmektedir?',
    answer: 'Tüm ürünlerimiz %100 doğal malzemelerden üretilmektedir. Keten, organik pamuk, bambu ve sürdürülebilir lifler koleksiyonumuzun temelini oluşturur. Her malzeme etik kaynaklıdır ve çevre dostu üretim süreçleri kullanılır.',
    category: 'urunler',
    order: 1,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    question: 'Perde ölçüsü nasıl alınır?',
    answer: 'Perde ölçüsü alırken, pencere genişliğine 20-30 cm eklemenizi öneririz. Yükseklik için tavan veya tavan süsünden zemine kadar ölçüm yapın. Ücretsiz ölçü hizmetimiz için bizimle iletişime geçebilirsiniz.',
    category: 'urunler',
    order: 2,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    question: 'Siparişimi nasıl verebilirim?',
    answer: 'Web sitemiz üzerinden, telefonla veya showroomlarımızda sipariş verebilirsiniz. Özel ölçü ve tasarım talepleriniz için uzman ekibimizle görüşmenizi öneririz.',
    category: 'siparis',
    order: 3,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    question: 'Teslimat süresi ne kadardır?',
    answer: 'Standart ürünler için 3-5 iş günü, özel ölçü perdeler için 2-4 hafta teslimat süresi bulunmaktadır. İstanbul içi ücretsiz montaj hizmeti sunuyoruz.',
    category: 'teslimat',
    order: 4,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '5',
    question: 'İade ve değişim koşulları nelerdir?',
    answer: 'Standart ürünlerde 14 gün içinde koşulsuz iade hakkınız bulunmaktadır. Özel ölçü ve kişiye özel ürünlerde iade yapılamamaktadır. Değişim için ürünün kullanılmamış ve orijinal ambalajında olması gerekmektedir.',
    category: 'iade',
    order: 5,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '6',
    question: 'Showroomlarınız nerede bulunmaktadır?',
    answer: 'Ana showroom\'umuz Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul adresinde bulunmaktadır. Hafta içi 09:00-18:00, Cumartesi 10:00-16:00 arasında ziyaret edebilirsiniz.',
    category: 'genel',
    order: 6,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '7',
    question: 'Ürünleriniz garanti kapsamında mıdır?',
    answer: 'Evet, tüm ürünlerimiz 2 yıl garanti kapsamındadır. Üretim hatalarından kaynaklanan sorunlarda ücretsiz onarım veya değişim yapılır. Garanti koşulları detayları için ürünle birlikte gelen garanti belgesini inceleyebilirsiniz.',
    category: 'urunler',
    order: 7,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '8',
    question: 'Montaj hizmeti veriyor musunuz?',
    answer: 'Evet, İstanbul içi tüm siparişlerde ücretsiz profesyonel montaj hizmeti sunuyoruz. Diğer şehirler için montaj ekibi yönlendirmemiz veya montaj kiti sağlamamız mümkündür.',
    category: 'teslimat',
    order: 8,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
]

const categoryLabels: Record<string, string> = {
  tumu: 'Tümü',
  genel: 'Genel',
  urunler: 'Ürünler',
  siparis: 'Sipariş',
  teslimat: 'Teslimat',
  iade: 'İade',
}

// ============================================
// FAQ Page Component
// ============================================
export default function FAQPage() {
  const { contact } = useSiteSettings()
  const { content: managedPage } = usePageContent('sikca-sorulan-sorular')

  const [activeSection, setActiveSection] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('tumu')
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const res = await fetch('/api/faq?active=true')
        const data = await res.json()
        if (data.success && data.data && data.data.length > 0) {
          setFaqs(data.data)
        } else {
          setFaqs(fallbackFAQs)
        }
      } catch (error) {
        console.error('Error fetching FAQs:', error)
        setFaqs(fallbackFAQs)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFAQs()
  }, [])

  const filteredFAQs =
    activeCategory === 'tumu'
      ? faqs
      : faqs.filter((faq) => faq.category === activeCategory)

  const navLinks = [
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/galeri', label: 'Galeri' },
    { href: '/koleksiyonlar', label: 'Koleksiyonlar' },
    { href: '/sikca-sorulan-sorular', label: 'SSS' },
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
                    link.href === '/sikca-sorulan-sorular'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-500 ${
                      link.href === '/sikca-sorulan-sorular' ? 'w-full' : 'w-0'
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
            <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              Destek
            </p>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-foreground leading-tight mb-6 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              Sıkça Sorulan <span className="font-normal italic">Sorular</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              Merak ettiğiniz soruların cevaplarını burada bulabilirsiniz.
              Başka sorularınız için bizimle iletişime geçmekten çekinmeyin.
            </p>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-6">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-12 justify-center opacity-0 translate-y-8 animate-fade-in-up stagger-3 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              {Object.entries(categoryLabels).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={`px-5 py-2.5 rounded-full text-sm tracking-wide transition-all duration-300 ${
                    activeCategory === key
                      ? 'bg-foreground text-background'
                      : 'bg-sand-100 text-muted-foreground hover:bg-sand-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Loading State */}
            {isLoading && (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
              </div>
            )}

            {/* FAQ Accordion */}
            {!isLoading && filteredFAQs.length > 0 && (
              <Accordion type="single" collapsible className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <AccordionItem
                    key={faq.id}
                    value={faq.id}
                    className="bg-card border border-border/50 rounded-2xl px-6 data-[state=open]:shadow-md transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left text-foreground hover:no-underline py-6">
                      <div className="flex items-start gap-4">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full bg-sand-100 flex items-center justify-center text-sm font-medium text-muted-foreground">
                          {index + 1}
                        </span>
                        <span className="text-base md:text-lg font-medium">
                          {faq.question}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-6 pl-12">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}

            {/* Empty State */}
            {!isLoading && filteredFAQs.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">
                  Bu kategoride henüz soru bulunmuyor.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 md:py-24 bg-foreground">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-light text-background mb-4 opacity-0 translate-y-8 animate-fade-in-up in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              Sorunuzun cevabını <span className="font-normal italic">bulamadınız mı?</span>
            </h2>
            <p className="text-background/80 mb-8 opacity-0 translate-y-8 animate-fade-in-up stagger-1 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              Ekibimiz sorularınızı yanıtlamaktan mutluluk duyar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 translate-y-8 animate-fade-in-up stagger-2 in-view:opacity-100 in-view:translate-y-0 in-view:duration-1000">
              <a
                href="/#iletisim"
                className="px-8 py-4 bg-background text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-background/90 hover:shadow-lg"
              >
                Bize Ulaşın
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
        body: JSON.stringify({ email, source: 'faq-page' }),
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

