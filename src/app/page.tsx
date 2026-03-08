import type { Metadata } from 'next'
import HomePageClient from '@/components/HomePageClient'
import { getHomePageContent } from '@/lib/home-page-content'

export async function generateMetadata(): Promise<Metadata> {
  const content = await getHomePageContent()

  return {
    title: content.seoTitle,
    description: content.seoDescription,
    openGraph: {
      title: content.seoTitle,
      description: content.seoDescription,
      images: [
        {
          url: '/images/og-image.png',
          width: 1200,
          height: 630,
          alt: 'ÖzTelevi - Ev Tekstili ve Perdeleri',
        },
      ],
    },
    twitter: {
      title: content.seoTitle,
      description: content.seoDescription,
      images: ['/images/og-image.png'],
    },
  }
}

export default async function HomePage() {
  const content = await getHomePageContent()

  return <HomePageClient content={content} />
}
