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

export function usePageContent(slug: string) {
  const [content, setContent] = useState<ManagedPageContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/pages/${slug}`)
        const data = await res.json()
        if (active && data.success) {
          setContent(data.data)
        }
      } catch (error) {
        console.error('Page content fetch error:', error)
      } finally {
        if (active) setLoading(false)
      }
    }

    load()
    return () => {
      active = false
    }
  }, [slug])

  return { content, loading }
}
