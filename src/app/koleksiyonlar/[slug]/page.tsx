import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { buildManagedCollectionsFromSections } from '@/lib/managed-collections'
import { SITE_URL } from '@/lib/site'
import { sanitizeImageUrl, sanitizeUrl } from '@/lib/content-sanitizer'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const detail = await resolveCollectionDetail(slug)

  if (!detail) {
    return {
      title: 'Ürün Bulunamadı | ÖzTelevi',
    }
  }

  return {
    title: `${detail.name} | Ürünlerimiz | ÖzTelevi`,
    description:
      detail.description ||
      'ÖzTelevi ürün detayını inceleyin ve size özel teklif alın.',
    alternates: {
      canonical: `${SITE_URL}/koleksiyonlar/${detail.slug}`,
    },
    openGraph: {
      title: detail.name,
      description:
        detail.description ||
        'ÖzTelevi ürün detayını inceleyin ve size özel teklif alın.',
      images: detail.image ? [detail.image] : [],
    },
  }
}

async function resolveCollectionDetail(slug: string) {
  const managedPage = await db.contentPage.findUnique({
    where: { slug: 'koleksiyonlar' },
    select: {
      sections: true,
      heroCtaLink: true,
      heroCtaText: true,
    },
  })

  const managedCollections = buildManagedCollectionsFromSections(
    managedPage?.sections
  ).collections
  const managedItem = managedCollections.find((item) => item.slug === slug)

  if (managedItem) {
    return {
      ...managedItem,
      ctaLink: managedPage?.heroCtaLink || '/#iletisim',
      ctaText: managedPage?.heroCtaText || 'Teklif Alın',
    }
  }

  const dbCollection = await db.collection.findUnique({
    where: { slug },
  })

  if (!dbCollection) return null

  return {
    id: dbCollection.id,
    name: dbCollection.name,
    slug: dbCollection.slug,
    description: dbCollection.description,
    image: dbCollection.image,
    featured: dbCollection.featured,
    order: dbCollection.order,
    createdAt: dbCollection.createdAt.toISOString(),
    updatedAt: dbCollection.updatedAt.toISOString(),
    ctaLink: '/#iletisim',
    ctaText: 'Teklif Alın',
  }
}

export default async function CollectionDetailPage({ params }: PageProps) {
  const { slug } = await params
  const detail = await resolveCollectionDetail(slug)

  if (!detail) {
    notFound()
  }

  const image = sanitizeImageUrl(detail.image) || '/images/hero.png'
  const ctaLink = sanitizeUrl(detail.ctaLink, { allowAnchor: true }) || '/#iletisim'

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b border-border/60 bg-sand-50">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <Link
            href="/koleksiyonlar"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Ürünlerimiz
          </Link>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-12 md:grid-cols-[1.1fr_0.9fr] md:py-20">
        <div className="relative min-h-[360px] overflow-hidden rounded-3xl bg-stone-100 shadow-sm">
          <Image
            src={image}
            alt={detail.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="mb-4 text-sm uppercase tracking-[0.28em] text-muted-foreground">
            Ürün Detayı
          </p>
          <h1 className="text-4xl font-light leading-tight text-foreground md:text-5xl">
            {detail.name}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            {detail.description || 'Bu ürün için açıklama henüz eklenmedi.'}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={ctaLink}
              className="inline-flex items-center justify-center rounded-full bg-foreground px-7 py-3 text-sm tracking-wide text-background transition-colors hover:bg-foreground/90"
            >
              {detail.ctaText || 'Teklif Alın'}
            </Link>
            <Link
              href="/koleksiyonlar"
              className="inline-flex items-center justify-center rounded-full border border-border px-7 py-3 text-sm tracking-wide text-foreground transition-colors hover:bg-stone-50"
            >
              Tüm Ürünlerimiz
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
