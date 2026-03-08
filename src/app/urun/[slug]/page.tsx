import type { Metadata } from 'next'
import ProductDetailClient from '@/components/product/ProductDetailClient'
import { getPublicProductBySlug, getRelatedProducts } from '@/lib/public-catalog'
import { toAbsoluteUrl } from '@/lib/site'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getPublicProductBySlug(slug)

  if (!product) {
    return {
      title: 'Ürün',
      description: 'ÖzTelevi ürün detay sayfası.',
      alternates: {
        canonical: toAbsoluteUrl(`/urun/${slug}`),
      },
    }
  }

  return {
    title: product.name,
    description: product.description.slice(0, 160),
    alternates: {
      canonical: toAbsoluteUrl(`/urun/${slug}`),
    },
    openGraph: {
      title: `${product.name} | ÖzTelevi`,
      description: product.description.slice(0, 160),
      url: toAbsoluteUrl(`/urun/${slug}`),
      images: [
        {
          url: toAbsoluteUrl(product.image),
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | ÖzTelevi`,
      description: product.description.slice(0, 160),
      images: [toAbsoluteUrl(product.image)],
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getPublicProductBySlug(slug)
  const relatedProducts = product
    ? await getRelatedProducts(product.rawCategory, product.slug)
    : []

  return (
    <ProductDetailClient
      slug={slug}
      initialProduct={product}
      initialRelatedProducts={relatedProducts}
    />
  )
}
