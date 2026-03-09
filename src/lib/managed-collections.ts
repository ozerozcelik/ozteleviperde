export interface CollectionItem {
  id: string
  name: string
  slug: string
  description: string | null
  image: string | null
  featured: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export type ManagedSection = {
  key?: string
  title?: string
  content?: string
  items?: string[]
  link?: string
  linkText?: string
}

export function generateCollectionSlug(name: string, index: number) {
  const normalized = name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return normalized || `urun-${index + 1}`
}

export function parseManagedSections(raw: string | null | undefined): ManagedSection[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function parseManagedCollectionItem(
  item: string | undefined,
  fallbackImage: string,
  index: number
): CollectionItem {
  let name = ''
  let description = ''
  let image = fallbackImage

  if (item) {
    try {
      const parsed = JSON.parse(item) as {
        title?: unknown
        description?: unknown
        image?: unknown
      }

      if (parsed && typeof parsed === 'object') {
        name = typeof parsed.title === 'string' ? parsed.title : ''
        description =
          typeof parsed.description === 'string' ? parsed.description : ''
        image =
          typeof parsed.image === 'string' && parsed.image.trim().length > 0
            ? parsed.image
            : fallbackImage
      }
    } catch {
      const [rawName, ...rest] = item.split(' - ')
      name = rawName.trim()
      description = rest.join(' - ').trim()
    }
  }

  const resolvedName = name || `Ürün ${index + 1}`

  return {
    id: `managed-${index}`,
    name: resolvedName,
    slug: generateCollectionSlug(resolvedName, index),
    description: description || null,
    image: image || null,
    featured: false,
    order: index,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function buildManagedCollectionsFromSections(
  rawSections: string | null | undefined
) {
  const managedSections = parseManagedSections(rawSections)
  const featuredSection = managedSections.find(
    (section) => section.key === 'collections-featured'
  )
  const allSection = managedSections.find(
    (section) => section.key === 'collections-all'
  )
  const gallerySection = managedSections.find(
    (section) => section.key === 'collections-gallery'
  )
  const ctaSection = managedSections.find(
    (section) => section.key === 'collections-cta'
  )
  const galleryImages = gallerySection?.items || []

  const featuredCollections = (featuredSection?.items || []).map(
    (item, index) => ({
      ...parseManagedCollectionItem(item, galleryImages[index] || '', index),
      featured: true,
      order: index,
    })
  )

  const otherCollections = (allSection?.items || []).map((item, index) => ({
    ...parseManagedCollectionItem(
      item,
      galleryImages[featuredCollections.length + index] || '',
      featuredCollections.length + index
    ),
    featured: false,
    order: featuredCollections.length + index,
  }))

  return {
    managedSections,
    featuredSection,
    allSection,
    gallerySection,
    ctaSection,
    collections: [...featuredCollections, ...otherCollections],
  }
}
