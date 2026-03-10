'use client'

import { useEffect, useState } from 'react'

interface ManagedPageContent {
  slug: string
  title: string
  seoTitle: string | null
  seoDescription: string | null
  heroTitle: string | null
  heroSubtitle: string | null
  heroImage: string | null
  heroCtaText: string | null
  heroCtaLink: string | null
  sections: string | null
  htmlContent: string | null
  schemaJson: string | null
  status: string
  updatedAt: string
}

const PAGE_CONTENT_CACHE_TTL_MS = 60_000

const pageContentCache = new Map<
  string,
  { value: ManagedPageContent | null; fetchedAt: number }
>()
const pageContentRequests = new Map<string, Promise<ManagedPageContent | null>>()

function getCachedPageContent(slug: string) {
  const cachedEntry = pageContentCache.get(slug)
  if (!cachedEntry) return undefined

  if (Date.now() - cachedEntry.fetchedAt > PAGE_CONTENT_CACHE_TTL_MS) {
    pageContentCache.delete(slug)
    return undefined
  }

  return cachedEntry.value
}

async function fetchManagedPageContent(
  slug: string,
  signal?: AbortSignal
): Promise<ManagedPageContent | null> {
  const cachedContent = getCachedPageContent(slug)
  if (cachedContent !== undefined) {
    return cachedContent
  }

  const inFlightRequest = pageContentRequests.get(slug)
  if (inFlightRequest) {
    return inFlightRequest
  }

  const request = fetch(`/api/pages/${slug}`, { signal })
    .then(async (res) => {
      const data = await res.json()
      const resolvedContent =
        res.ok && data.success ? (data.data as ManagedPageContent | null) : null
      pageContentCache.set(slug, {
        value: resolvedContent,
        fetchedAt: Date.now(),
      })
      return resolvedContent
    })
    .finally(() => {
      pageContentRequests.delete(slug)
    })

  pageContentRequests.set(slug, request)
  return request
}

export function usePageContent(slug: string) {
  const [content, setContent] = useState<ManagedPageContent | null>(
    () => getCachedPageContent(slug) ?? null
  )
  const [loading, setLoading] = useState(() => getCachedPageContent(slug) === undefined)

  useEffect(() => {
    let active = true
    const controller = new AbortController()

    const load = async () => {
      const cachedContent = getCachedPageContent(slug)
      if (cachedContent !== undefined) {
        setContent(cachedContent)
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        const nextContent = await fetchManagedPageContent(slug, controller.signal)
        if (active) {
          setContent(nextContent)
        }
      } catch (error) {
        if (controller.signal.aborted) return
        console.error('Page content fetch error:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
      controller.abort()
    }
  }, [slug])

  return { content, loading }
}
