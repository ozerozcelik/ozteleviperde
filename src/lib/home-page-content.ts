import { unstable_noStore as noStore } from 'next/cache'
import { db } from '@/lib/db'
import { getPageEditorPreset, type PageEditorSection } from '@/lib/page-editor-presets'
import { sanitizeImageUrl, sanitizeUrl } from '@/lib/content-sanitizer'

type StoredHomePage = {
  seoTitle: string | null
  seoDescription: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroImage: string | null
  heroCtaText: string | null
  heroCtaLink: string | null
  sections: string | null
  status: string
}

type ContentPair = {
  title: string
  description: string
}

type LinkItem = {
  label: string
  href: string
}

type TestimonialItem = {
  quote: string
  author: string
  location: string
}

export type HomePageContent = {
  seoTitle: string
  seoDescription: string
  hero: {
    eyebrow: string
    title: string
    subtitle: string
    image: string
    primaryCtaText: string
    primaryCtaLink: string
    secondaryCtaText: string
    secondaryCtaLink: string
  }
  visualizer: {
    badge: string
    title: string
    description: string
    ctaText: string
    ctaLink: string
  }
  philosophy: {
    eyebrow: string
    title: string
    description: string
    principles: ContentPair[]
  }
  products: {
    eyebrow: string
    title: string
    description: string
  }
  craftsmanship: {
    eyebrow: string
    title: string
    description: string
    linkText: string
    linkHref: string
    features: ContentPair[]
  }
  livingSpaces: {
    eyebrow: string
    title: string
    description: string
    images: string[]
  }
  testimonials: {
    eyebrow: string
    title: string
    description: string
    featuredQuoteText: string
    featuredQuoteAttribution: string
    items: TestimonialItem[]
  }
  contact: {
    eyebrow: string
    title: string
    description: string
    details: {
      email: string
      phone: string
      address: string
    }
  }
  footer: {
    collectionLinks: LinkItem[]
    companyLinks: LinkItem[]
  }
}

function normalizeText(value: string | null | undefined, fallback: string) {
  if (!value) return fallback
  const trimmed = value.trim()
  return trimmed.length ? trimmed : fallback
}

function normalizeLink(
  value: string | null | undefined,
  fallback: string
) {
  return (
    sanitizeUrl(value, { allowAnchor: true }) ||
    sanitizeUrl(fallback, { allowAnchor: true }) ||
    '#'
  )
}

function normalizeImage(
  value: string | null | undefined,
  fallback: string
) {
  return sanitizeImageUrl(value) || sanitizeImageUrl(fallback) || '/images/hero.png'
}

function normalizeImageList(items: string[] | undefined, fallback: string[]) {
  const sanitized = (items || [])
    .map((item) => sanitizeImageUrl(item))
    .filter((item): item is string => Boolean(item))

  if (sanitized.length >= 2) {
    return sanitized
  }

  const fallbackSanitized = fallback
    .map((item) => sanitizeImageUrl(item))
    .filter((item): item is string => Boolean(item))

  return fallbackSanitized.length > 0
    ? fallbackSanitized
    : ['/images/hero.png', '/images/scene-bedroom.png']
}

function parseSections(value: string | null | undefined): PageEditorSection[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed as PageEditorSection[] : []
  } catch {
    return []
  }
}

function normalizeKey(value: string | undefined) {
  return (value || '').trim().toLowerCase()
}

function normalizeTitle(value: string | undefined) {
  return (value || '')
    .toLowerCase()
    .replace(/[^a-z0-9ığüşöç\s-]/gi, '')
    .trim()
}

function findMatchingSection(
  sections: PageEditorSection[],
  fallbackSection: PageEditorSection,
  fallbackIndex: number
) {
  const fallbackKey = normalizeKey(fallbackSection.key)
  const fallbackTitle = normalizeTitle(fallbackSection.title)

  const matchedByIdentity = sections.find((section) => {
    if (fallbackKey && normalizeKey(section.key) === fallbackKey) {
      return true
    }

    return fallbackTitle.length > 0 && normalizeTitle(section.title) === fallbackTitle
  })

  if (matchedByIdentity) {
    return matchedByIdentity
  }

  return sections[fallbackIndex]
}

function mergeSection(
  fallbackSection: PageEditorSection,
  sections: PageEditorSection[],
  fallbackIndex: number
) {
  const match = findMatchingSection(sections, fallbackSection, fallbackIndex)
  if (!match) return fallbackSection

  return {
    ...fallbackSection,
    ...match,
    items: Array.isArray(match.items) && match.items.length > 0 ? match.items : fallbackSection.items,
  }
}

function parseFeatureItems(items: string[] | undefined, fallback: ContentPair[]) {
  if (!Array.isArray(items) || items.length === 0) return fallback

  const parsed = items
    .map((item) => {
      const [title, ...rest] = item.split(' - ')
      return {
        title: title?.trim() || '',
        description: rest.join(' - ').trim(),
      }
    })
    .filter((item) => item.title.length > 0 && item.description.length > 0)

  return parsed.length > 0 ? parsed : fallback
}

function parseContactDetails(items: string[] | undefined, fallback: [string, string, string]) {
  const [fallbackEmail, fallbackPhone, fallbackAddress] = fallback

  return {
    email: normalizeText(items?.[0], fallbackEmail),
    phone: normalizeText(items?.[1], fallbackPhone),
    address: normalizeText(items?.[2], fallbackAddress),
  }
}

function parsePipeSeparatedItems(items: string[] | undefined, expectedParts: number) {
  return (items || [])
    .map((item) => item.split('|').map((part) => part.trim()))
    .filter((parts) => parts.length >= expectedParts && parts.every((part) => part.length > 0))
}

function parseTestimonials(items: string[] | undefined, fallback: TestimonialItem[]) {
  const parsed = parsePipeSeparatedItems(items, 3).map(([author, location, quote]) => ({
    author,
    location,
    quote,
  }))

  return parsed.length > 0 ? parsed : fallback
}

function parseFooterLinks(items: string[] | undefined, fallback: LinkItem[]) {
  const parsed = parsePipeSeparatedItems(items, 2)
    .map(([label, href]) => ({
      label,
      href: normalizeLink(href, '#'),
    }))
    .filter((item) => item.label.length > 0)

  return parsed.length > 0 ? parsed : fallback
}

export async function getHomePageContent(): Promise<HomePageContent> {
  noStore()

  const baseline = getPageEditorPreset('anasayfa')
  if (!baseline) {
    throw new Error('Home page preset is missing.')
  }

  const page = await db.contentPage.findUnique({
    where: { slug: 'anasayfa' },
    select: {
      seoTitle: true,
      seoDescription: true,
      heroTitle: true,
      heroSubtitle: true,
      heroImage: true,
      heroCtaText: true,
      heroCtaLink: true,
      sections: true,
      status: true,
    },
  })

  const publishedPage: StoredHomePage | null =
    page && page.status === 'published' ? page : null

  const pageSections = parseSections(publishedPage?.sections)
  const baselineSections = baseline.sections
  const visualizerSection = mergeSection(baselineSections[0], pageSections, 0)
  const philosophySection = mergeSection(baselineSections[1], pageSections, 1)
  const productsSection = mergeSection(baselineSections[2], pageSections, 2)
  const craftsmanshipSection = mergeSection(baselineSections[3], pageSections, 3)
  const livingSpacesSection = mergeSection(baselineSections[4], pageSections, 4)
  const signatureQuoteSection = mergeSection(baselineSections[5], pageSections, 5)
  const testimonialsSection = mergeSection(baselineSections[6], pageSections, 6)
  const contactSection = mergeSection(baselineSections[7], pageSections, 7)
  const footerCollectionSection = mergeSection(baselineSections[8], pageSections, 8)
  const footerCompanySection = mergeSection(baselineSections[9], pageSections, 9)

  return {
    seoTitle: normalizeText(publishedPage?.seoTitle, baseline.seoTitle),
    seoDescription: normalizeText(publishedPage?.seoDescription, baseline.seoDescription),
    hero: {
      eyebrow: 'Ev Tekstili & Perdeleri',
      title: normalizeText(publishedPage?.heroTitle, baseline.heroTitle),
      subtitle: normalizeText(publishedPage?.heroSubtitle, baseline.heroSubtitle),
      image: normalizeImage(publishedPage?.heroImage, baseline.heroImage),
      primaryCtaText: normalizeText(publishedPage?.heroCtaText, baseline.heroCtaText),
      primaryCtaLink: normalizeLink(publishedPage?.heroCtaLink, baseline.heroCtaLink),
      secondaryCtaText: 'Felsefemiz',
      secondaryCtaLink: '#felsefe',
    },
    visualizer: {
      badge: 'Yeni Özellik',
      title: normalizeText(visualizerSection.title, baselineSections[0].title || ''),
      description: normalizeText(visualizerSection.content, baselineSections[0].content || ''),
      ctaText: normalizeText(visualizerSection.linkText, baselineSections[0].linkText || 'Hemen Deneyin'),
      ctaLink: normalizeLink(visualizerSection.link, baselineSections[0].link || '/visualizer'),
    },
    philosophy: {
      eyebrow: 'Felsefemiz',
      title: normalizeText(philosophySection.title, baselineSections[1].title || ''),
      description: normalizeText(philosophySection.content, baselineSections[1].content || ''),
      principles: parseFeatureItems(philosophySection.items, [
        {
          title: 'Sadelik',
          description:
            'Gereksiz olandan arınır, sadece gerçek huzur ve mutluluk getireni bırakırız. Her parça, sessiz bir zarafetle amacına hizmet etmek için düşünülmüştür.',
        },
        {
          title: 'Doğal Malzemeler',
          description:
            'Keten, organik pamuk ve sürdürülebilir lifler koleksiyonumuzun temelini oluşturur. Doğal kusurların özgün güzelliğine saygı duyarız.',
        },
        {
          title: 'Zamansız Tasarım',
          description:
            'Trendler geçer, huzur kalır. Tasarımlarımız mevsimleri aşar, her zaman sakin ve davetkar hissettiren mekanlar yaratır.',
        },
        {
          title: 'Farkında Yaşam',
          description:
            'Oluşturduğumuz her tekstil, yavaşlamak, derin nefes almak ve günlük anların ince güzelliğini takdir etmek için bir davettir.',
        },
      ]),
    },
    products: {
      eyebrow: 'Koleksiyon',
      title: normalizeText(productsSection.title, baselineSections[2].title || ''),
      description: normalizeText(productsSection.content, baselineSections[2].content || ''),
    },
    craftsmanship: {
      eyebrow: 'Zanaat',
      title: normalizeText(craftsmanshipSection.title, baselineSections[3].title || ''),
      description: normalizeText(craftsmanshipSection.content, baselineSections[3].content || ''),
      linkText: 'Ustalarımızla Tanışın',
      linkHref: normalizeLink(craftsmanshipSection.link, baselineSections[3].link || '#'),
      features: parseFeatureItems(craftsmanshipSection.items, [
        {
          title: 'Usta Ortaklar',
          description:
            "Kaliteye olan bağlılığımızı paylaşan Japonya ve İskandinavya'nın yetenekli zanaatkarlarıyla işbirliği yapıyoruz.",
        },
        {
          title: 'Zamanın Test Ettiği Teknikler',
          description:
            'Kuşaktan kuşağa aktarılan geleneksel dokuma yöntemleri, olağanüstü dayanıklılık ve doku sağlar.',
        },
        {
          title: 'Sürdürülebilir Kaynak',
          description:
            'Her malzeme etik kaynaklıdır, çiftlikten bitmiş ürüne kadar tam izlenebilirlik sağlanır.',
        },
        {
          title: 'Kalite Güvencesi',
          description:
            'Her parça, titiz standartlarımızı karşıladığından emin olmak için dikkatle incelenir.',
        },
      ]),
    },
    livingSpaces: {
      eyebrow: 'Yaşam Mekanları',
      title: normalizeText(livingSpacesSection.title, baselineSections[4].title || ''),
      description: normalizeText(livingSpacesSection.content, baselineSections[4].content || ''),
      images: normalizeImageList(
        livingSpacesSection.items,
        baselineSections[4].items || ['/images/hero.png', '/images/scene-bedroom.png']
      ),
    },
    testimonials: {
      eyebrow: 'Müşteri Yorumları',
      title: normalizeText(testimonialsSection.title, baselineSections[6].title || ''),
      description: normalizeText(testimonialsSection.content, baselineSections[6].content || ''),
      featuredQuoteText: normalizeText(
        signatureQuoteSection.title,
        baselineSections[5].title || ''
      ),
      featuredQuoteAttribution: normalizeText(
        signatureQuoteSection.content,
        baselineSections[5].content || ''
      ),
      items: parseTestimonials(testimonialsSection.items, [
        {
          quote:
            'Bu perdeler ev ofisimi huzurlu bir sığınağa dönüştürdü. Kalite mükemmel ve ışığı süzme şekli basitçe güzel.',
          author: 'Selin A.',
          location: 'İstanbul',
        },
        {
          quote:
            'Bu kadar yumuşak ve nefes alabilen bir yatak örtüsüyle hiç karşılaşmamıştım. Bulutun üzerinde uyumak gibi. Doğal renkler minimalist estetiğimle mükemmel uyum sağlıyor.',
          author: 'Mehmet K.',
          location: 'Ankara',
        },
        {
          quote:
            "ÖzTelevi'den her parça niyetli hissettiriyor. İşçilik her ayrıntıda belli. Bu, ev için yavaş moda.",
          author: 'Elif Y.',
          location: 'İzmir',
        },
      ]),
    },
    contact: {
      eyebrow: normalizeText(contactSection.linkText, baselineSections[7].linkText || 'Yolculuğunuza Başlayın'),
      title: normalizeText(contactSection.title, baselineSections[7].title || ''),
      description: normalizeText(contactSection.content, baselineSections[7].content || ''),
      details: parseContactDetails(contactSection.items, [
        'info@oztelevi.com',
        '+90 (212) 555 0123',
        'Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul',
      ]),
    },
    footer: {
      collectionLinks: parseFooterLinks(footerCollectionSection.items, [
        { label: 'Perdeler', href: '/galeri' },
        { label: 'Yatak Örtüleri', href: '/galeri' },
        { label: 'Atkılar', href: '/galeri' },
        { label: 'Minderler', href: '/galeri' },
      ]),
      companyLinks: parseFooterLinks(footerCompanySection.items, [
        { label: 'Hikayemiz', href: '/hakkimizda' },
        { label: 'Ustalarımız', href: '/hakkimizda' },
        { label: 'Sürdürülebilirlik', href: '/hakkimizda' },
        { label: 'Basın', href: '/blog' },
      ]),
    },
  }
}
