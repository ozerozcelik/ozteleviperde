'use client'

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import ManagedPage from '@/components/ManagedPage'
import ManagedPageLoading from '@/components/ManagedPageLoading'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { getPageEditorPreset, type PageEditorSection } from '@/lib/page-editor-presets'

type AssistantOption = {
  id: string
  label: string
  description: string
}

type Recommendation = {
  title: string
  summary: string
  fabric: string
  lining: string
  color: string
}

function parseSections(value: string | null | undefined): PageEditorSection[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as PageEditorSection[]) : []
  } catch {
    return []
  }
}

function normalizeKey(value: string | undefined) {
  return (value || '').trim().toLowerCase()
}

function findSection(sections: PageEditorSection[], key: string) {
  return sections.find((section) => normalizeKey(section.key) === key)
}

function mergeSection(
  key: string,
  fallback: PageEditorSection | undefined,
  sections: PageEditorSection[]
) {
  const match = findSection(sections, key)

  if (!fallback) return match || null
  if (!match) return fallback

  return {
    ...fallback,
    ...match,
    items: Array.isArray(match.items) && match.items.length > 0 ? match.items : fallback.items,
  }
}

function normalizeText(value: string | null | undefined, fallback: string) {
  if (value === null || value === undefined) return fallback
  return value.trim()
}

function normalizeLegacyVisualizerCopy(value: string | null | undefined, fallback: string) {
  if (value === null || value === undefined) return fallback
  const trimmed = value.trim()
  if (!trimmed) return ''

  const legacyValues = new Set([
    'Visualizer',
    '3D Görselleştirici',
    'Perdelerinizi Görselleştirin',
    'Mekanınıza en uygun perdeyi seçin. Farklı oda türleri, stiller ve renklerle tasarımınızı önizleyin.',
    'Ürünleri İncele',
    'Oda Görselleştirici',
  ])

  return legacyValues.has(trimmed) ? fallback : trimmed
}

const roomOptions: AssistantOption[] = [
  {
    id: 'salon',
    label: 'Salon',
    description: 'Daha gösterişli, dengeli ve misafir ağırlamaya uygun bir çözüm.',
  },
  {
    id: 'yatak-odasi',
    label: 'Yatak Odası',
    description: 'Mahremiyet ve dinlenme odaklı daha yumuşak bir seçim.',
  },
  {
    id: 'calisma-odasi',
    label: 'Çalışma Odası',
    description: 'Dikkat dağıtmayan, ışık kontrolü güçlü bir kurgu.',
  },
]

const lightOptions: AssistantOption[] = [
  {
    id: 'yumusak',
    label: 'Yumuşak Işık',
    description: 'Gün ışığı kırılarak içeri alınsın istiyorum.',
  },
  {
    id: 'denge',
    label: 'Dengeli Işık',
    description: 'Işık gelsin ama parlamayı da kontrol etsin.',
  },
  {
    id: 'kontrollu',
    label: 'Kontrollü Işık',
    description: 'Işık ve parlama mümkün olduğunca sınırlandırılsın.',
  },
]

const privacyOptions: AssistantOption[] = [
  {
    id: 'dusuk',
    label: 'Düşük',
    description: 'Açık ve ferah görünüm öncelikli.',
  },
  {
    id: 'orta',
    label: 'Orta',
    description: 'Günlük kullanım için dengeli mahremiyet.',
  },
  {
    id: 'yuksek',
    label: 'Yüksek',
    description: 'İç mekanın görünürlüğü minimum olsun.',
  },
]

const styleOptions: AssistantOption[] = [
  {
    id: 'dogal',
    label: 'Doğal',
    description: 'Keten ve sıcak tonlarla yumuşak, zamansız görünüm.',
  },
  {
    id: 'minimal',
    label: 'Minimal',
    description: 'Sade çizgiler, temiz yüzeyler, sakin tonlar.',
  },
  {
    id: 'sicak',
    label: 'Sıcak',
    description: 'Daha dokulu, katmanlı ve davetkar atmosfer.',
  },
]

function getRecommendation({
  room,
  light,
  privacy,
  style,
}: {
  room: string
  light: string
  privacy: string
  style: string
}): Recommendation {
  const baseFabric =
    privacy === 'yuksek' ? 'Blackout destekli keten karışım' :
    light === 'yumusak' ? 'Yarı transparan tül-keten karışımı' :
    'Dokulu keten fon'

  const baseLining =
    privacy === 'yuksek' ? 'Tam astarlı çözüm' :
    light === 'denge' ? 'İnce astarlı çift kat kullanım' :
    'Astarsız veya hafif astarlı çözüm'

  const baseColor =
    style === 'minimal' ? 'Kırık beyaz, taş ve kum tonları' :
    style === 'sicak' ? 'Kil, bej ve sıcak grej tonları' :
    'Doğal keten, açık bej ve yumuşak adaçayı tonları'

  const roomSummary =
    room === 'salon'
      ? 'Salon için katmanlı bir perde kurgusu öneriyoruz; hem gün ışığını dengeler hem de daha tamamlanmış bir görünüm sağlar.'
      : room === 'yatak-odasi'
        ? 'Yatak odasında ışık kontrolü ve mahremiyetin dengeli olduğu, daha sakin ve yumuşak bir kurgu öneriyoruz.'
        : 'Çalışma odasında dikkat dağıtmayan, ekran yansımalarını azaltan ve temiz bir görünüm veren çözüm daha doğru olur.'

  return {
    title:
      privacy === 'yuksek'
        ? 'Mahremiyet Odaklı Kombin'
        : light === 'yumusak'
          ? 'Yumuşak Işık Kombini'
          : 'Dengeli Gün Işığı Kombini',
    summary: roomSummary,
    fabric: baseFabric,
    lining: baseLining,
    color: baseColor,
  }
}

function ChoiceGroup({
  title,
  options,
  value,
  onChange,
}: {
  title: string
  options: AssistantOption[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm tracking-[0.22em] uppercase text-muted-foreground">{title}</h3>
      <div className="grid gap-3">
        {options.map((option) => {
          const selected = value === option.id

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onChange(option.id)}
              className={`rounded-2xl border px-4 py-4 text-left transition-all duration-300 ${
                selected
                  ? 'border-foreground bg-foreground text-background shadow-[0_14px_36px_rgba(41,37,36,0.16)]'
                  : 'border-border/60 bg-card hover:border-foreground/30 hover:bg-card/80'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-medium">{option.label}</p>
                  <p className={`mt-1 text-sm ${selected ? 'text-background/80' : 'text-muted-foreground'}`}>
                    {option.description}
                  </p>
                </div>
                <span
                  className={`mt-1 h-3 w-3 rounded-full ${
                    selected ? 'bg-background' : 'bg-wood-300'
                  }`}
                />
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function VisualizerPage() {
  const { content: managedPage, loading } = usePageContent('visualizer')
  const { contact } = useSiteSettings()
  const baseline = getPageEditorPreset('visualizer')
  const baselineHeroEyebrow = baseline?.heroCtaText || 'Akıllı Yönlendirme'
  const baselineHeroTitle = baseline?.heroTitle || 'Perde Seçim Asistanı'
  const baselineHeroSubtitle =
    baseline?.heroSubtitle ||
    'Birkaç kısa seçimle mekanınıza en uygun perde yaklaşımını bulun. Kumaş, mahremiyet ve ışık kontrolü için net bir başlangıç önerisi alın.'
  const baselinePageTitle = baseline?.title || 'Perde Seçim Asistanı'
  const pageSections = parseSections(managedPage?.sections)
  const stepSection = mergeSection(
    'visualizer-steps',
    baseline?.sections.find((section) => section.key === 'visualizer-steps'),
    pageSections
  )
  const ctaSection = mergeSection(
    'visualizer-cta',
    baseline?.sections.find((section) => section.key === 'visualizer-cta'),
    pageSections
  )

  const [room, setRoom] = useState(roomOptions[0].id)
  const [light, setLight] = useState(lightOptions[1].id)
  const [privacy, setPrivacy] = useState(privacyOptions[1].id)
  const [style, setStyle] = useState(styleOptions[0].id)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    phone: '',
    width: '',
    height: '',
    quantity: '1',
    notes: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submitMessage, setSubmitMessage] = useState('')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const heroEyebrow = normalizeLegacyVisualizerCopy(
    managedPage?.heroCtaText,
    baselineHeroEyebrow
  )
  const heroTitle = normalizeLegacyVisualizerCopy(
    managedPage?.heroTitle,
    baselineHeroTitle
  )
  const heroSubtitle = normalizeLegacyVisualizerCopy(
    managedPage?.heroSubtitle,
    baselineHeroSubtitle
  )
  const pageTitle = normalizeLegacyVisualizerCopy(managedPage?.title, baselinePageTitle)
  const ctaTitle = normalizeText(ctaSection?.title, 'Uzmanlarımızla Netleştirin')
  const ctaDescription = normalizeText(
    ctaSection?.content,
    'Asistan size başlangıç yönü verir. Ölçü, kumaş ve katman kararını birlikte netleştirmek için ekibimizle iletişime geçin.'
  )
  const ctaButtonText = normalizeText(ctaSection?.linkText, 'Teklif Al')
  const ctaButtonLink = '#teklif-formu'
  const stepItems = (stepSection?.items || [
    '1. Oda Tipi - Mekanınızı seçin.',
    '2. Işık ve Mahremiyet - İhtiyacınızı belirleyin.',
    '3. Stil Tercihi - Size uygun yönlendirmeyi alın.',
  ]).slice(0, 3)

  const recommendation = useMemo(
    () => getRecommendation({ room, light, privacy, style }),
    [room, light, privacy, style]
  )
  const roomLabel = roomOptions.find((option) => option.id === room)?.label || room
  const lightLabel = lightOptions.find((option) => option.id === light)?.label || light
  const privacyLabel = privacyOptions.find((option) => option.id === privacy)?.label || privacy
  const styleLabel = styleOptions.find((option) => option.id === style)?.label || style

  const handleQuoteInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target
    setQuoteForm((current) => ({ ...current, [name]: value }))
  }

  const handleQuoteSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')
    setSubmitMessage('')

    const summaryLines = [
      `Asistan önerisi: ${recommendation.title}`,
      `Mekan tipi: ${roomLabel}`,
      `Işık ihtiyacı: ${lightLabel}`,
      `Mahremiyet: ${privacyLabel}`,
      `Stil yönü: ${styleLabel}`,
      `Önerilen kumaş: ${recommendation.fabric}`,
      `Önerilen kurgu: ${recommendation.lining}`,
      `Renk yönü: ${recommendation.color}`,
      `Ölçü: ${quoteForm.width} cm x ${quoteForm.height} cm`,
      `Adet: ${quoteForm.quantity}`,
    ]

    if (quoteForm.notes.trim()) {
      summaryLines.push(`Ek not: ${quoteForm.notes.trim()}`)
    }

    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: quoteForm.name,
          email: quoteForm.email,
          phone: quoteForm.phone,
          productType: 'Perde Seçim Asistanı',
          message: summaryLines.join('\n'),
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setSubmitStatus('success')
        setSubmitMessage('Ölçüleriniz ve tercihlerinizi aldık. Size en kısa sürede dönüş yapacağız.')
        setQuoteForm({
          name: '',
          email: '',
          phone: '',
          width: '',
          height: '',
          quantity: '1',
          notes: '',
        })
      } else {
        setSubmitStatus('error')
        setSubmitMessage(data.error || 'Teklif talebi gönderilemedi. Lütfen tekrar deneyin.')
      }
    } catch {
      setSubmitStatus('error')
      setSubmitMessage('Teklif talebi gönderilemedi. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading && !managedPage) {
    return <ManagedPageLoading />
  }

  if (managedPage?.htmlContent) {
    return (
      <ManagedPage
        html={managedPage.htmlContent}
        schemaJson={managedPage.schemaJson}
        heroTitle={managedPage.heroTitle}
        heroSubtitle={managedPage.heroSubtitle}
        heroImage={managedPage.heroImage}
        heroCtaText={managedPage.heroCtaText}
        heroCtaLink={managedPage.heroCtaLink}
        sections={managedPage.sections}
      />
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled ? 'bg-background/95 backdrop-blur-md shadow-sm' : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <OzTeleviLogo />

            <div className="hidden md:flex items-center gap-10">
              <Link href="/hakkimizda" className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500">
                Hakkımızda
              </Link>
              <Link href="/koleksiyonlar" className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500">
                Koleksiyonlar
              </Link>
              <Link href="/galeri" className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500">
                Galeri
              </Link>
              <Link href="/blog" className="text-sm tracking-wide text-muted-foreground hover:text-foreground transition-all duration-500">
                Blog
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/giris"
                className="px-4 py-2 text-sm tracking-wide text-foreground border border-foreground/30 rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5"
              >
                Giriş
              </Link>
              <a
                href={ctaButtonLink}
                className="px-6 py-2.5 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                {ctaButtonText}
              </a>
            </div>

            <button
              onClick={() => setIsMobileMenuOpen((value) => !value)}
              className="md:hidden p-2 text-foreground"
              aria-label="Menüyü aç/kapat"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                {isMobileMenuOpen ? <path d="M6 18L18 6M6 6l12 12" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>

          <div
            className={`md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md border-t border-border/50 ${
              isMobileMenuOpen ? 'max-h-[70vh] pb-6 overflow-y-auto' : 'max-h-0'
            }`}
          >
            <div className="flex flex-col gap-4 pt-4">
              {[
                { href: '/hakkimizda', label: 'Hakkımızda' },
                { href: '/koleksiyonlar', label: 'Koleksiyonlar' },
                { href: '/galeri', label: 'Galeri' },
                { href: '/blog', label: 'Blog' },
              ].map((link) => (
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
                href={ctaButtonLink}
                onClick={() => setIsMobileMenuOpen(false)}
                className="mt-2 px-6 py-3 bg-foreground text-background text-center text-sm tracking-wide rounded-full"
              >
                {ctaButtonText}
              </a>
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-1 pt-20">
        <section className="relative overflow-hidden bg-gradient-to-b from-sand-50 to-background py-16 md:py-24">
          <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(180,151,120,0.12),transparent_60%)]" />
          <div className="max-w-6xl mx-auto px-6 lg:px-8 relative">
            <div className="max-w-3xl">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-5">{heroEyebrow}</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-foreground leading-tight">{heroTitle}</h1>
              <p className="mt-6 text-lg text-muted-foreground leading-relaxed">{heroSubtitle}</p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-20">
          <div className="max-w-6xl mx-auto px-6 lg:px-8 grid gap-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-8">
              <div className="rounded-[28px] border border-border/60 bg-card p-6 md:p-8 shadow-[0_20px_60px_rgba(120,113,108,0.10)]">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                  <div>
                    <p className="text-sm tracking-[0.26em] uppercase text-muted-foreground mb-2">Karar Yardımı</p>
                    <h2 className="text-2xl md:text-3xl font-light text-foreground">{pageTitle}</h2>
                  </div>
                  <div className="rounded-full bg-sand-100 px-4 py-2 text-sm text-foreground">
                    4 kısa seçim
                  </div>
                </div>

                <div className="grid gap-8">
                  <ChoiceGroup title="1. Mekan tipi" options={roomOptions} value={room} onChange={setRoom} />
                  <ChoiceGroup title="2. Işık ihtiyacı" options={lightOptions} value={light} onChange={setLight} />
                  <ChoiceGroup title="3. Mahremiyet seviyesi" options={privacyOptions} value={privacy} onChange={setPrivacy} />
                  <ChoiceGroup title="4. Stil yönü" options={styleOptions} value={style} onChange={setStyle} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {stepItems.map((item) => {
                  const [title, ...rest] = item.split(' - ')
                  return (
                    <div key={item} className="rounded-2xl border border-border/60 bg-sand-50 p-5">
                      <p className="text-sm font-medium text-foreground">{title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{rest.join(' - ') || item}</p>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="lg:sticky lg:top-28 h-fit space-y-6">
              <div className="rounded-[28px] bg-foreground p-6 md:p-8 text-background shadow-[0_22px_60px_rgba(41,37,36,0.18)]">
                <p className="text-sm tracking-[0.26em] uppercase text-background/65 mb-3">Önerilen Yön</p>
                <h3 className="text-2xl md:text-3xl font-light">{recommendation.title}</h3>
                <p className="mt-4 text-background/80 leading-relaxed">{recommendation.summary}</p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl bg-background/8 p-4">
                    <p className="text-xs tracking-[0.22em] uppercase text-background/60 mb-2">Kumaş</p>
                    <p className="text-sm">{recommendation.fabric}</p>
                  </div>
                  <div className="rounded-2xl bg-background/8 p-4">
                    <p className="text-xs tracking-[0.22em] uppercase text-background/60 mb-2">Kurgu</p>
                    <p className="text-sm">{recommendation.lining}</p>
                  </div>
                  <div className="rounded-2xl bg-background/8 p-4">
                    <p className="text-xs tracking-[0.22em] uppercase text-background/60 mb-2">Renk Yönü</p>
                    <p className="text-sm">{recommendation.color}</p>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <a
                    href={ctaButtonLink}
                    className="inline-flex items-center justify-center rounded-full bg-background px-6 py-3 text-sm tracking-wide text-foreground transition hover:bg-background/90"
                  >
                    {ctaButtonText}
                  </a>
                  <a
                    href={contact.phoneHref}
                    className="inline-flex items-center justify-center rounded-full border border-background/25 px-6 py-3 text-sm tracking-wide text-background transition hover:border-background/45"
                  >
                    {contact.phoneDisplay}
                  </a>
                </div>
              </div>

              <div className="rounded-[24px] border border-border/60 bg-card p-6">
                <p className="text-sm tracking-[0.26em] uppercase text-muted-foreground mb-3">Sonraki Adım</p>
                <h3 className="text-xl font-light text-foreground">{ctaTitle}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{ctaDescription}</p>
              </div>
            </div>
          </div>
        </section>

        <section id="teklif-formu" className="pb-16 md:pb-24">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[28px] border border-border/60 bg-sand-50 p-6 md:p-8">
                <p className="text-sm tracking-[0.26em] uppercase text-muted-foreground mb-3">Ölçü ile Teklif</p>
                <h2 className="text-2xl md:text-3xl font-light text-foreground">Perdenizi ölçüyle netleştirelim</h2>
                <p className="mt-4 text-muted-foreground leading-relaxed">
                  Genişlik, yükseklik ve adet bilgilerini bırakın. Asistanın önerdiği perde yönüyle birlikte ekibimiz size uygun teklif hazırlasın.
                </p>

                <div className="mt-8 space-y-4">
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground mb-2">Asistan Özeti</p>
                    <p className="text-base font-medium text-foreground">{recommendation.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{roomLabel} • {lightLabel} • {privacyLabel} • {styleLabel}</p>
                  </div>
                  <div className="rounded-2xl border border-border/60 bg-background p-4">
                    <p className="text-xs tracking-[0.22em] uppercase text-muted-foreground mb-2">Öneri</p>
                    <p className="text-sm text-foreground">Kumaş: {recommendation.fabric}</p>
                    <p className="mt-2 text-sm text-foreground">Kurgu: {recommendation.lining}</p>
                    <p className="mt-2 text-sm text-foreground">Renk yönü: {recommendation.color}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[28px] border border-border/60 bg-card p-6 md:p-8 shadow-[0_20px_60px_rgba(120,113,108,0.10)]">
                <form onSubmit={handleQuoteSubmit} className="space-y-5">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="quote-name" className="block text-sm text-muted-foreground mb-2">
                        Ad Soyad *
                      </label>
                      <input
                        id="quote-name"
                        name="name"
                        type="text"
                        required
                        value={quoteForm.name}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                        placeholder="Adınızı girin"
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-email" className="block text-sm text-muted-foreground mb-2">
                        E-posta *
                      </label>
                      <input
                        id="quote-email"
                        name="email"
                        type="email"
                        required
                        value={quoteForm.email}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                        placeholder="ornek@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="quote-phone" className="block text-sm text-muted-foreground mb-2">
                        Telefon
                      </label>
                      <input
                        id="quote-phone"
                        name="phone"
                        type="tel"
                        value={quoteForm.phone}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                        placeholder="+90 5xx xxx xx xx"
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-quantity" className="block text-sm text-muted-foreground mb-2">
                        Adet *
                      </label>
                      <input
                        id="quote-quantity"
                        name="quantity"
                        type="number"
                        min="1"
                        required
                        value={quoteForm.quantity}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                      />
                    </div>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="quote-width" className="block text-sm text-muted-foreground mb-2">
                        Genişlik (cm) *
                      </label>
                      <input
                        id="quote-width"
                        name="width"
                        type="number"
                        min="1"
                        step="0.1"
                        required
                        value={quoteForm.width}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                        placeholder="Örn. 240"
                      />
                    </div>
                    <div>
                      <label htmlFor="quote-height" className="block text-sm text-muted-foreground mb-2">
                        Yükseklik (cm) *
                      </label>
                      <input
                        id="quote-height"
                        name="height"
                        type="number"
                        min="1"
                        step="0.1"
                        required
                        value={quoteForm.height}
                        onChange={handleQuoteInputChange}
                        className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                        placeholder="Örn. 260"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="quote-notes" className="block text-sm text-muted-foreground mb-2">
                      Ek Notlar
                    </label>
                    <textarea
                      id="quote-notes"
                      name="notes"
                      rows={4}
                      value={quoteForm.notes}
                      onChange={handleQuoteInputChange}
                      className="w-full rounded-xl border border-border/70 bg-background px-4 py-3 text-foreground outline-none transition focus:border-foreground/40"
                      placeholder="Ray tipi, pencere adedi, montaj bilgisi veya özel notunuzu yazın"
                    />
                  </div>

                  {submitStatus !== 'idle' && (
                    <div
                      className={`rounded-xl border px-4 py-3 text-sm ${
                        submitStatus === 'success'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                          : 'border-red-200 bg-red-50 text-red-700'
                      }`}
                    >
                      {submitMessage}
                    </div>
                  )}

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm tracking-wide text-background transition hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSubmitting ? 'Gönderiliyor...' : ctaButtonText}
                    </button>
                    <a
                      href={contact.phoneHref}
                      className="inline-flex items-center justify-center rounded-full border border-border/70 px-6 py-3 text-sm tracking-wide text-foreground transition hover:border-foreground/40 hover:bg-sand-50"
                    >
                      Telefonla Ulaşın
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
