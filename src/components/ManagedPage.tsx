'use client'

import Script from 'next/script'
import Link from 'next/link'
import {
  sanitizeImageUrl,
  sanitizeJsonLd,
  sanitizeRichHtml,
  sanitizeUrl,
  stripHtmlTags,
} from '@/lib/content-sanitizer'

interface HeroSection {
  title?: string
  subtitle?: string
  image?: string
  ctaText?: string
  ctaLink?: string
}

interface Section {
  type: 'hero' | 'text' | 'image' | 'cta' | 'features' | 'gallery'
  title?: string
  content?: string
  image?: string
  items?: string[]
  link?: string
  linkText?: string
}

function toSafeSections(raw: unknown): Section[] {
  if (!Array.isArray(raw)) return []

  return raw
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map((item) => ({
      type:
        item.type === 'hero' ||
        item.type === 'text' ||
        item.type === 'image' ||
        item.type === 'cta' ||
        item.type === 'features' ||
        item.type === 'gallery'
          ? item.type
          : 'text',
      title: typeof item.title === 'string' ? item.title : undefined,
      content: typeof item.content === 'string' ? item.content : undefined,
      image:
        typeof item.image === 'string'
          ? sanitizeImageUrl(item.image) || undefined
          : undefined,
      items: Array.isArray(item.items)
        ? item.items.filter((v): v is string => typeof v === 'string')
        : undefined,
      link:
        typeof item.link === 'string'
          ? sanitizeUrl(item.link, { allowAnchor: true }) || undefined
          : undefined,
      linkText: typeof item.linkText === 'string' ? item.linkText : undefined,
    }))
}

interface ManagedPageProps {
  html?: string | null
  schemaJson?: string | null
  heroTitle?: string | null
  heroSubtitle?: string | null
  heroImage?: string | null
  heroCtaText?: string | null
  heroCtaLink?: string | null
  sections?: string | null
}

export default function ManagedPage({ 
  html, 
  schemaJson,
  heroTitle,
  heroSubtitle,
  heroImage,
  heroCtaText,
  heroCtaLink,
  sections 
}: ManagedPageProps) {
  const safeHtml = sanitizeRichHtml(html)
  const safeSchemaJson = sanitizeJsonLd(schemaJson)
  const safeHeroImage = sanitizeImageUrl(heroImage)
  const safeHeroCtaLink = sanitizeUrl(heroCtaLink, { allowAnchor: true }) || '#'
  let parsedSections: Section[] = []
  try {
    if (sections) {
      const parsed = typeof sections === 'string' ? JSON.parse(sections) : sections
      parsedSections = toSafeSections(parsed)
    }
  } catch (e) {
    console.error('Error parsing sections:', e)
    parsedSections = []
  }

  const hasStructuredContent = heroTitle || heroSubtitle || heroImage || parsedSections.length > 0

  return (
    <>
      {safeSchemaJson ? (
        <Script id="managed-page-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeSchemaJson }} />
      ) : null}
      <main className="min-h-screen bg-background text-foreground">
        {hasStructuredContent ? (
          <div className="flex flex-col gap-16 py-16">
            {/* Hero Section */}
            {(heroTitle || heroSubtitle || safeHeroImage) && (
              <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center">
                {safeHeroImage && (
                  <div className="absolute inset-0 z-0">
                    <img
                      src={safeHeroImage}
                      alt={heroTitle || 'Hero'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40" />
                  </div>
                )}
                <div className="relative z-10 text-center text-white px-4 max-w-4xl">
                  {heroTitle && (
                    <h1 className="text-4xl md:text-6xl font-light mb-4">{heroTitle}</h1>
                  )}
                  {heroSubtitle && (
                    <p className="text-xl md:text-2xl opacity-90 mb-8">{heroSubtitle}</p>
                  )}
                  {heroCtaText && (
                    <Link 
                      href={safeHeroCtaLink} 
                      className="inline-block bg-white text-black px-8 py-3 text-lg hover:bg-opacity-90 transition"
                    >
                      {heroCtaText}
                    </Link>
                  )}
                </div>
              </section>
            )}

            {/* Dynamic Sections */}
            {parsedSections.map((section, index) => (
              <section key={index} className="max-w-6xl mx-auto px-6 w-full">
                {section.type === 'text' && (
                  <div className="prose prose-stone max-w-none">
                    <h2>{section.title}</h2>
                    <div dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(section.content) }} />
                  </div>
                )}
                {section.type === 'image' && section.image && (
                  <div className="relative h-[400px] w-full">
                    <img
                      src={section.image}
                      alt={section.title || 'Image'}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                )}
                {section.type === 'cta' && (
                  <div className="text-center py-12 bg-stone-100 rounded-lg">
                    <h2 className="text-3xl mb-4">{section.title}</h2>
                    {section.content && <p className="mb-6 text-lg opacity-80">{stripHtmlTags(sanitizeRichHtml(section.content))}</p>}
                    {section.link && (
                      <Link 
                        href={section.link} 
                        className="inline-block bg-stone-900 text-white px-8 py-3 text-lg hover:bg-stone-800 transition"
                      >
                        {section.linkText || 'Detaylar'}
                      </Link>
                    )}
                  </div>
                )}
                {section.type === 'features' && section.items && (
                  <div className="grid md:grid-cols-3 gap-8">
                    {section.items.map((item, i) => (
                      <div key={i} className="text-center p-6 border border-stone-200 rounded-lg">
                        <p className="text-lg">{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {section.type === 'gallery' && section.items && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {section.items.map((img, i) => (
                      <div key={i} className="relative h-48">
                        <img src={img} alt={`Gallery ${i}`} className="w-full h-full object-cover rounded-lg" />
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}

            {/* Legacy HTML Content */}
            {safeHtml && (
              <div className="max-w-6xl mx-auto px-6 prose prose-stone max-w-none">
                <div dangerouslySetInnerHTML={{ __html: safeHtml }} />
              </div>
            )}
          </div>
        ) : safeHtml ? (
          <div
            className="mx-auto max-w-6xl px-6 py-24 prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: safeHtml }}
          />
        ) : (
          <div className="flex items-center justify-center min-h-[50vh]">
            <p className="text-stone-500">Bu sayfa için içerik henüz eklenmemiş.</p>
          </div>
        )}
      </main>
    </>
  )
}
