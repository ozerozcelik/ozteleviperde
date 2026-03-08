import { db } from '@/lib/db'
import { slugToPath } from '@/lib/content-pages'

export type MediaUsageRef = {
  label: string
  href: string
}

type UsageMap = Map<string, MediaUsageRef[]>

function addUsage(usageMap: UsageMap, url: string | null | undefined, ref: MediaUsageRef) {
  if (!url || typeof url !== 'string') return
  const normalized = url.trim()
  if (!normalized) return

  const current = usageMap.get(normalized) || []
  if (!current.some((item) => item.label === ref.label && item.href === ref.href)) {
    current.push(ref)
  }
  usageMap.set(normalized, current)
}

function collectSectionUrls(rawSections: string | null | undefined, ref: MediaUsageRef, usageMap: UsageMap) {
  if (!rawSections) return

  try {
    const parsed = JSON.parse(rawSections)
    if (!Array.isArray(parsed)) return

    for (const section of parsed) {
      if (!section || typeof section !== 'object') continue
      const candidate = section as {
        image?: unknown
        items?: unknown
        content?: unknown
      }

      if (typeof candidate.image === 'string') {
        addUsage(usageMap, candidate.image, ref)
      }

      if (Array.isArray(candidate.items)) {
        for (const item of candidate.items) {
          if (typeof item === 'string' && (item.startsWith('/') || item.startsWith('http'))) {
            addUsage(usageMap, item, ref)
          }
        }
      }

      if (typeof candidate.content === 'string') {
        for (const match of candidate.content.matchAll(/https?:\/\/[^\s"'<>]+|\/uploads\/[^\s"'<>]+/g)) {
          addUsage(usageMap, match[0], ref)
        }
      }
    }
  } catch {
    // ignore malformed JSON
  }
}

function collectJsonUrls(rawJson: string | null | undefined, ref: MediaUsageRef, usageMap: UsageMap) {
  if (!rawJson) return

  try {
    const parsed = JSON.parse(rawJson)
    if (!Array.isArray(parsed)) return
    for (const item of parsed) {
      if (typeof item === 'string') {
        addUsage(usageMap, item, ref)
      }
    }
  } catch {
    // ignore malformed JSON
  }
}

function collectTextUrls(rawText: string | null | undefined, ref: MediaUsageRef, usageMap: UsageMap) {
  if (!rawText) return

  for (const match of rawText.matchAll(/https?:\/\/[^\s"'<>]+|\/uploads\/[^\s"'<>]+/g)) {
    addUsage(usageMap, match[0], ref)
  }
}

export async function buildMediaUsageMap() {
  const usageMap: UsageMap = new Map()

  const [products, collections, pages, blogs] = await Promise.all([
    db.product.findMany({
      select: { id: true, name: true, slug: true, image: true, images: true, description: true },
    }),
    db.collection.findMany({
      select: { id: true, name: true, slug: true, image: true },
    }),
    db.contentPage.findMany({
      select: { slug: true, title: true, heroImage: true, sections: true, htmlContent: true },
    }),
    db.blog.findMany({
      select: { id: true, title: true, slug: true, image: true, content: true, excerpt: true },
    }),
  ])

  for (const product of products) {
    const ref = {
      label: `Urun: ${product.name}`,
      href: `/urun/${product.slug}`,
    }
    addUsage(usageMap, product.image, ref)
    collectJsonUrls(product.images, ref, usageMap)
    collectTextUrls(product.description, ref, usageMap)
  }

  for (const collection of collections) {
    addUsage(usageMap, collection.image, {
      label: `Koleksiyon: ${collection.name}`,
      href: `/koleksiyonlar`,
    })
  }

  for (const page of pages) {
    const ref = {
      label: `Sayfa: ${page.title}`,
      href: slugToPath(page.slug),
    }
    addUsage(usageMap, page.heroImage, ref)
    collectSectionUrls(page.sections, ref, usageMap)
    collectTextUrls(page.htmlContent, ref, usageMap)
  }

  for (const blog of blogs) {
    const ref = {
      label: `Blog: ${blog.title}`,
      href: `/blog/${blog.slug}`,
    }
    addUsage(usageMap, blog.image, ref)
    collectTextUrls(blog.content, ref, usageMap)
    collectTextUrls(blog.excerpt, ref, usageMap)
  }

  return usageMap
}
