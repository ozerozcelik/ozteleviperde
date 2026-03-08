'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import SocialMediaButtons from '@/components/SocialMediaButtons'
import ManagedPage from '@/components/ManagedPage'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'
import { sanitizeImageUrl, sanitizeUrl } from '@/lib/content-sanitizer'
import { getPageEditorPreset, type PageEditorSection } from '@/lib/page-editor-presets'

type ContentPair = {
  title: string
  description: string
}

type TeamMember = {
  name: string
  role: string
  bio: string
  image: string
}

type QuoteCard = {
  text: string
  author: string
  role: string
  image: string
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
  const trimmed = value?.trim()
  return trimmed ? trimmed : fallback
}

function parseFeatureItems(items: string[] | undefined, fallback: ContentPair[]) {
  const parsed = (items || [])
    .map((item, index) => {
      const [title, ...rest] = item.split(' - ')
      const normalizedTitle = title?.trim() || fallback[index]?.title || ''
      const description = rest.join(' - ').trim()

      if (normalizedTitle && description) {
        return {
          title: normalizedTitle,
          description,
        }
      }

      const plainText = item.trim()
      return {
        title: normalizedTitle,
        description: plainText,
      }
    })
    .filter((item) => item.title.length > 0 && item.description.length > 0)

  return parsed.length > 0 ? parsed : fallback
}

function collectParagraphs(
  content: string | undefined,
  items: string[] | undefined,
  fallback: string[]
) {
  const paragraphs = [content || '', ...(items || [])]
    .map((item) => item.trim())
    .filter(Boolean)

  return paragraphs.length > 0 ? paragraphs : fallback
}

function parseTeamMembers(items: string[] | undefined, fallback: TeamMember[]) {
  const parsed = (items || [])
    .map((item) => {
      if (item.includes('|')) {
        const [name, role, bio, image] = item.split('|').map((part) => part.trim())
        return { name, role, bio, image }
      }

      const [name, role] = item.split(' - ').map((part) => part.trim())
      const existing = fallback.find((member) => member.name === name)

      return {
        name,
        role,
        bio: existing?.bio || '',
        image: existing?.image || '/images/hero.png',
      }
    })
    .filter((member) => member.name.length > 0 && member.role.length > 0)
    .map((member) => ({
      ...member,
      image: sanitizeImageUrl(member.image) || fallback.find((entry) => entry.name === member.name)?.image || '/images/hero.png',
    }))

  return parsed.length > 0 ? parsed : fallback
}

function parseQuoteCard(section: PageEditorSection | null, fallback: QuoteCard) {
  const [author, role] = (section?.content || '')
    .split('|')
    .map((part) => part.trim())

  return {
    text: normalizeText(section?.title, fallback.text),
    author: normalizeText(author, fallback.author),
    role: normalizeText(role, fallback.role),
    image: sanitizeImageUrl(section?.image) || fallback.image,
  }
}

// ============================================
// About Page - ÖzTelevi Hakkımızda
// ============================================
export default function AboutPage() {
  const { content: managedPage } = usePageContent('hakkimizda')

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
    { href: '/hakkimizda', label: 'Hakkımızda' },
    { href: '/galeri', label: 'Galeri' },
    { href: '/koleksiyonlar', label: 'Koleksiyonlar' },
    { href: '/sikca-sorulan-sorular', label: 'SSS' },
  ]

  const baseline = getPageEditorPreset('hakkimizda')
  const baselineSections = baseline?.sections || []
  const pageSections = parseSections(managedPage?.sections)

  const storySection = mergeSection('about-story', baselineSections[0], pageSections)
  const missionVisionSection = mergeSection('about-mission-vision', baselineSections[1], pageSections)
  const valuesSection = mergeSection('about-values', baselineSections[2], pageSections)
  const teamSection = mergeSection('about-team', baselineSections[3], pageSections)
  const quoteSection = mergeSection('about-quote', baselineSections[4], pageSections)
  const ctaSection = mergeSection('about-cta', baselineSections[5], pageSections)

  const heroTitle = normalizeText(managedPage?.heroTitle, baseline?.heroTitle || 'Işığın Huzurla Buluştuğu Yer')
  const heroSubtitle = normalizeText(
    managedPage?.heroSubtitle,
    baseline?.heroSubtitle ||
      '1998 yılından bu yana, evleri sığınağa dönüştüren tekstiller yaratıyoruz.'
  )
  const heroImage = sanitizeImageUrl(managedPage?.heroImage) || sanitizeImageUrl(baseline?.heroImage) || '/images/hero.png'

  const storyParagraphs = collectParagraphs(storySection?.content, storySection?.items, [
    'ÖzTelevi, 1998 yılında Ayşe Özdemir’in tekstil sanatına olan tutkusundan doğdu. Japonya’yı ziyareti sırasında karşılaştığı wabi-sabi felsefesi ve İskandinav tasarımının sıcak minimalizmi, markanın temelini oluşturdu.',
    'İlk atölyemiz, İstanbul’un kalbinde, Teşvikiye’de küçük bir bodrum katında açıldı. El dokuması perdelerimiz ve organik tekstillerimiz, kısa sürede sadelik ve kalite arayan müşterilerimizin beğenisini kazandı.',
    'Bugün, üç kuşaktır süren zanaat geleneğimizi modern tasarım anlayışıyla birleştirerek, Türkiye’nin önde gelen ev tekstili markalarından biri olarak yolculuğumuza devam ediyoruz.',
  ])

  const missionVision = parseFeatureItems(missionVisionSection?.items, [
    {
      title: 'Misyonumuz',
      description:
        'Evleri gerçek sığınaklara dönüştüren, doğal malzemelerden üretilmiş, el işçiliği tekstiller ve perdeler sunmak.',
    },
    {
      title: 'Vizyonumuz',
      description:
        'Türkiye’nin en güvenilen ve sürdürülebilir ev tekstili markası olmak; Japandi estetiğini daha fazla yaşam alanına taşımak.',
    },
  ])

  const valueIcons = [
    (
      <svg key="value-icon-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    ),
    (
      <svg key="value-icon-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    (
      <svg key="value-icon-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
    (
      <svg key="value-icon-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
  ]

  const values = parseFeatureItems(valuesSection?.items, [
    {
      title: 'Sadakat',
      description: 'Kaliteye ve müşteri memnuniyetine olan sarsılmaz bağlılığımız.',
    },
    {
      title: 'Sürdürülebilirlik',
      description: 'Doğaya saygı, çevre dostu üretim ve etik kaynak kullanımı.',
    },
    {
      title: 'Tutku',
      description: 'Her dokunuşta hissedilen zanaata olan derin sevgimiz.',
    },
    {
      title: 'Dürüstlük',
      description: 'Şeffaflık ve dürüstlük üzerine kurulu güvenilir ilişkiler.',
    },
  ]).map((value, index) => ({
    ...value,
    icon: valueIcons[index] || valueIcons[valueIcons.length - 1],
  }))

  const team = parseTeamMembers(teamSection?.items, [
    {
      name: 'Ayşe Özdemir',
      role: 'Kurucu & Kreatif Direktör',
      image: '/images/hero.png',
      bio: "20 yılı aşkın tekstil deneyimiyle Japandi felsefesini Türkiye'ye taşıyor.",
    },
    {
      name: 'Mehmet Kaya',
      role: 'Üretim Direktörü',
      image: '/images/product-curtain.png',
      bio: 'El dokuma tekniklerinde uzman, sürdürülebilir üretimin mimarı.',
    },
    {
      name: 'Elif Yılmaz',
      role: 'Tasarım Lideri',
      image: '/images/product-textile.png',
      bio: 'İskandinav ve Japon estetiğini buluşturan tasarımlar yaratıyor.',
    },
    {
      name: 'Can Demir',
      role: 'Müşteri Deneyimi',
      image: '/images/scene-bedroom.png',
      bio: 'Her müşterinin hikayesini anlayan, kişisel çözümler sunuyor.',
    },
  ])

  const founderQuote = parseQuoteCard(quoteSection, {
    text:
      'Işığın bir mekan boyunca hareket etme biçimi, orada nasıl hissettiğimizi tanımlar. Perdelerimiz bu ilişkiye saygı duymak için tasarlandı.',
    author: 'Ayşe Özdemir',
    role: 'Kurucu',
    image: '/images/hero.png',
  })

  const ctaTitle = normalizeText(ctaSection?.title, 'Hikayemizin bir parçası olun')
  const ctaDescription = normalizeText(
    ctaSection?.content,
    'Showroom’umuzu ziyaret edin, koleksiyonumuzu keşfedin ve yaşam alanınızı dönüştürmeye başlayın.'
  )
  const ctaLink = sanitizeUrl(ctaSection?.link) || '/koleksiyonlar'
  const ctaLinkText = normalizeText(ctaSection?.linkText, 'Koleksiyonları Gör')

  if (managedPage?.htmlContent) {
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
                    link.href === '/hakkimizda'
                      ? 'text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-500 ${
                      link.href === '/hakkimizda' ? 'w-full' : 'w-0'
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
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={heroImage}
              alt="ÖzTelevi Hakkımızda"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background/95 via-background/80 to-background/60" />
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
            <div className="max-w-2xl">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Hakkımızda
              </p>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-light text-foreground leading-tight mb-6">
                {heroTitle}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {heroSubtitle}
              </p>
            </div>
          </div>
        </section>

        {/* Brand Story Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Content */}
              <div>
                <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
                  Hikayemiz
                </p>
                <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight mb-6">
                  {normalizeText(storySection?.title, 'Bir tutku hikayesi')}
                </h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  {storyParagraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>

              {/* Image */}
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                <Image
                  src="/images/scene-bedroom.png"
                  alt="ÖzTelevi atölyesi"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
              </div>
            </div>
          </div>
        </section>

        {/* Mission & Vision Section */}
        <section className="py-24 md:py-32 bg-sand-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
              {/* Mission */}
              <div className="p-8 lg:p-10 rounded-2xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-wood-100 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-wood-600">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-4">
                  {missionVision[0]?.title || 'Misyonumuz'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {missionVision[0]?.description}
                </p>
              </div>

              {/* Vision */}
              <div className="p-8 lg:p-10 rounded-2xl bg-card border border-border/50">
                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center mb-6">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6 text-sage-400">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-light text-foreground mb-4">
                  {missionVision[1]?.title || 'Vizyonumuz'}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {missionVision[1]?.description}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Değerlerimiz
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight">
                {normalizeText(valuesSection?.title, 'Ayakta durduğumuz temeller')}
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <div
                  key={value.title}
                  className="group p-6 rounded-2xl bg-card border border-border/50 transition-all duration-500 hover:border-border hover:shadow-lg text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-sand-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-sand-200 transition-colors">
                    <div className="text-muted-foreground group-hover:text-foreground transition-colors">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-2">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-24 md:py-32 bg-wood-50">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <p className="text-sm tracking-[0.3em] uppercase text-muted-foreground mb-6">
                Ekibimiz
              </p>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight mb-4">
                {normalizeText(teamSection?.title, 'Tutkulu insanlar')}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {normalizeText(
                  teamSection?.content,
                  'Her biri alanında uzman, zanaata ve kaliteye adamış ekibimizle tanışın.'
                )}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="group text-center"
                >
                  <div className="relative aspect-square rounded-2xl overflow-hidden mb-4">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  </div>
                  <h3 className="text-lg font-medium text-foreground mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    {member.role}
                  </p>
                  <p className="text-xs text-muted-foreground/80">
                    {member.bio}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quote Section */}
        <section className="py-24 md:py-32 bg-foreground">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <blockquote>
              <p className="text-2xl md:text-3xl font-light text-background leading-relaxed italic mb-8">
                &ldquo;{founderQuote.text}&rdquo;
              </p>
              <footer className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-full bg-background/20 overflow-hidden relative">
                  <Image
                    src={founderQuote.image}
                    alt={founderQuote.author}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="text-background font-medium">{founderQuote.author}</p>
                  <p className="text-background/70 text-sm">{founderQuote.role}</p>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 md:py-32 bg-background">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2 className="text-3xl sm:text-4xl font-light text-foreground leading-tight mb-6">
              {ctaTitle}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              {ctaDescription}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/#iletisim"
                className="px-8 py-4 bg-foreground text-background text-sm tracking-wide rounded-full transition-all duration-500 hover:bg-foreground/90 hover:shadow-lg"
              >
                Bize Ulaşın
              </a>
              <Link
                href={ctaLink}
                className="px-8 py-4 border border-foreground/30 text-foreground text-sm tracking-wide rounded-full transition-all duration-500 hover:border-foreground/50 hover:bg-foreground/5"
              >
                {ctaLinkText}
              </Link>
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
  const { contact, legal } = useSiteSettings()
  const [email, setEmail] = useState('')
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'about-page' }),
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
            <a href={legal.privacy} className="hover:text-background/70 transition-colors">Gizlilik Politikası</a>
            <a href={legal.terms} className="hover:text-background/70 transition-colors">Kullanım Şartları</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

