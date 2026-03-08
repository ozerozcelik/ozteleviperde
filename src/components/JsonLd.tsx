'use client'

import Script from 'next/script'
import { SITE_URL, toAbsoluteUrl } from '@/lib/site'

// ============================================
// Organization Schema
// ============================================
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'ÖzTelevi',
  url: SITE_URL,
  logo: toAbsoluteUrl('/images/logo.png'),
  description: 'Japon estetiğinin sade güzelliği ve İskandinav sadeliğinden ilham alan, el işçiliği tekstiller ve perdeler.',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Teşvikiye Mah., Bağdar Caddesi No:42',
    addressLocality: 'Şişli',
    addressRegion: 'İstanbul',
    postalCode: '34365',
    addressCountry: 'TR',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+90-212-555-0123',
    contactType: 'customer service',
    availableLanguage: 'Turkish',
  },
  sameAs: [
    'https://instagram.com/oztelevi',
    'https://pinterest.com/oztelevi',
    'https://facebook.com/oztelevi',
  ],
}

// ============================================
// WebSite Schema
// ============================================
const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'ÖzTelevi',
  url: SITE_URL,
}

// ============================================
// LocalBusiness Schema
// ============================================
const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'HomeGoodsStore',
  name: 'ÖzTelevi',
  image: toAbsoluteUrl('/images/hero.png'),
  '@id': SITE_URL,
  url: SITE_URL,
  telephone: '+90-212-555-0123',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Teşvikiye Mah., Bağdar Caddesi No:42',
    addressLocality: 'Şişli',
    addressRegion: 'İstanbul',
    postalCode: '34365',
    addressCountry: 'TR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.0517,
    longitude: 28.9833,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '09:00',
      closes: '18:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '10:00',
      closes: '16:00',
    },
  ],
  priceRange: '$$',
}

// ============================================
// Main Component - Organization & Website Schema
// ============================================
export function OrganizationJsonLd() {
  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="localbusiness-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
    </>
  )
}

// ============================================
// Product Schema Component
// ============================================
interface ProductSchemaProps {
  name: string
  description: string
  image: string
  price: number
  currency: string
  slug: string
  inStock: boolean
  category: string
}

export function ProductJsonLd({
  name,
  description,
  image,
  price,
  currency,
  slug,
  inStock,
  category,
}: ProductSchemaProps) {
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    image: toAbsoluteUrl(image),
    url: toAbsoluteUrl(`/urun/${slug}`),
    sku: slug,
    brand: {
      '@type': 'Brand',
      name: 'ÖzTelevi',
    },
    category,
    offers: {
      '@type': 'Offer',
      url: toAbsoluteUrl(`/urun/${slug}`),
      priceCurrency: currency,
      price,
      priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'ÖzTelevi',
      },
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '47',
    },
  }

  return (
    <Script
      id={`product-schema-${slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  )
}

// ============================================
// BreadcrumbList Schema Component
// ============================================
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: toAbsoluteUrl(item.url),
    })),
  }

  return (
    <Script
      id="breadcrumb-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  )
}

// ============================================
// FAQ Schema Component
// ============================================
interface FAQItem {
  question: string
  answer: string
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }

  return (
    <Script
      id="faq-schema"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
    />
  )
}
