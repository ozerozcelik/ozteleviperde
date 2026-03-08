export interface ContentPage {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published'
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
  updatedAt: string
  publishedAt: string | null
  versions?: { id: string; version: number; status: string; createdAt: string }[]
}

export type PageSection = {
  key?: string
  type: 'text' | 'image' | 'cta' | 'features' | 'gallery'
  title?: string
  content?: string
  image?: string
  items?: string[]
  link?: string
  linkText?: string
}

export interface MediaAsset {
  url: string
  publicId: string
  name: string
  createdAt: string
  folder?: string | null
  tags?: string[]
  width?: number | null
  height?: number | null
  bytes?: number | null
  usageCount?: number
  usedIn?: string[]
  usageRefs?: { label: string; href: string }[]
  canDelete?: boolean
  variants?: {
    original: string
    thumb: string
    card: string
    gallery: string
    hero: string
  }
}

export type ProductFormState = {
  name: string
  slug: string
  description: string
  price: string
  comparePrice: string
  currency: string
  category: string
  image: string
  images: string[]
  features: string[]
  inStock: boolean
  stock: string
  featured: boolean
}

export type ProductFieldConfig =
  | {
      key: keyof ProductFormState
      label: string
      type: 'text' | 'number' | 'textarea'
      required?: boolean
      placeholder?: string
      rows?: number
      autoSlug?: boolean
    }
  | {
      key: keyof ProductFormState
      label: string
      type: 'select'
      options: { value: string; label: string }[]
    }
  | {
      key: keyof ProductFormState
      label: string
      type: 'toggle'
    }
