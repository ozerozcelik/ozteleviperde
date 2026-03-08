import { db } from '@/lib/db'

function parseStringArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === 'string')
      : []
  } catch {
    return []
  }
}

const categoryLabels: Record<string, string> = {
  perdeler: 'Perdeler',
  tekstiller: 'Tekstiller',
  'yatak-odasi': 'Yatak Odası',
  aksesuarlar: 'Aksesuarlar',
}

export async function getPublicProductBySlug(slug: string) {
  const product = await db.product.findUnique({
    where: { slug },
  })

  if (!product) {
    return null
  }

  const mainImage = product.image || '/images/product-curtain.png'

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price: product.price,
    currency: product.currency,
    image: mainImage,
    inStock: product.inStock,
    images: [mainImage, ...parseStringArray(product.images)],
    features: parseStringArray(product.features),
    rawCategory: product.category,
    category: categoryLabels[product.category] || product.category,
  }
}

export async function getRelatedProducts(category: string, excludeSlug: string, limit = 3) {
  const products = await db.product.findMany({
    where: { category },
    orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    take: limit + 1,
  })

  return products
    .filter((product) => product.slug !== excludeSlug)
    .slice(0, limit)
    .map((product) => {
      const mainImage = product.image || '/images/product-curtain.png'

      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        price: product.price,
        currency: product.currency,
        image: mainImage,
        inStock: product.inStock,
        images: [mainImage, ...parseStringArray(product.images)],
        features: parseStringArray(product.features),
        rawCategory: product.category,
        category: categoryLabels[product.category] || product.category,
      }
    })
}

export async function getPublishedBlogBySlug(slug: string) {
  const blog = await db.blog.findUnique({
    where: { slug },
  })

  if (!blog || !blog.published) {
    return null
  }

  return {
    id: blog.id,
    title: blog.title,
    slug: blog.slug,
    content: blog.content,
    excerpt: blog.excerpt,
    category: blog.category,
    image: blog.image,
    author: blog.author,
    tags: parseStringArray(blog.tags),
    featured: blog.featured,
    viewCount: blog.viewCount,
    publishedAt: blog.publishedAt?.toISOString() || null,
    createdAt: blog.createdAt.toISOString(),
  }
}

export async function getRelatedBlogs(category: string | null, excludeId: string, limit = 2) {
  if (!category) return []

  const blogs = await db.blog.findMany({
    where: {
      published: true,
      category,
    },
    orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
    take: limit + 1,
  })

  return blogs
    .filter((blog) => blog.id !== excludeId)
    .slice(0, limit)
    .map((blog) => ({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      image: blog.image,
      category: blog.category,
      publishedAt: blog.publishedAt?.toISOString() || null,
    }))
}
