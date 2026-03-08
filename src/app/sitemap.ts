import { MetadataRoute } from 'next'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_URL
  const databaseUrl = process.env.DATABASE_URL ?? ''

  // Statik sayfalar
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/hakkimizda`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/koleksiyonlar`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/galeri`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/sikca-sorulan-sorular`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/visualizer`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Build-time'da geçersiz/eksik DB URL ile Prisma başlatmayı deneme.
  if (
    !databaseUrl.startsWith('postgresql://') &&
    !databaseUrl.startsWith('postgres://')
  ) {
    return staticPages
  }

  // Dinamik ürün sayfaları
  try {
    const [products, blogs] = await Promise.all([
      db.product.findMany({
        where: { inStock: true },
        select: { slug: true, updatedAt: true },
      }),
      db.blog.findMany({
        where: { published: true },
        select: { slug: true, updatedAt: true },
      }),
    ])

    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/urun/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }))

    const blogPages: MetadataRoute.Sitemap = blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    }))

    return [...staticPages, ...productPages, ...blogPages]
  } catch {
    // Veritabanı hatası durumunda sadece statik sayfaları döndür
    return staticPages
  }
}
