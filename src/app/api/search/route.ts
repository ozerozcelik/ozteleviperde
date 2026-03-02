import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Arama API - Ürünler ve blog yazılarında arama
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all' // all, products, blogs
    const limit = parseInt(searchParams.get('limit') || '10')

    if (!query.trim()) {
      return NextResponse.json({
        success: true,
        data: {
          products: [],
          blogs: [],
        },
      })
    }

    const searchTerms = query.toLowerCase().trim()
    const results: {
      products: Array<Record<string, unknown>>
      blogs: Array<Record<string, unknown>>
    } = {
      products: [],
      blogs: [],
    }

    // Ürünlerde ara
    if (type === 'all' || type === 'products') {
      const products = await db.product.findMany({
        where: {
          OR: [
            { name: { contains: searchTerms } },
            { description: { contains: searchTerms } },
            { category: { contains: searchTerms } },
            { collection: { contains: searchTerms } },
          ],
        },
        take: limit,
        orderBy: { createdAt: 'desc' },
      })

      results.products = products.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        currency: p.currency,
        category: p.category,
        image: p.image,
        inStock: p.inStock,
        featured: p.featured,
      }))
    }

    // Blog yazılarında ara
    if (type === 'all' || type === 'blogs') {
      const blogs = await db.blog.findMany({
        where: {
          published: true,
          OR: [
            { title: { contains: searchTerms } },
            { excerpt: { contains: searchTerms } },
            { content: { contains: searchTerms } },
            { category: { contains: searchTerms } },
          ],
        },
        take: limit,
        orderBy: { publishedAt: 'desc' },
      })

      results.blogs = blogs.map((b) => ({
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        category: b.category,
        image: b.image,
        publishedAt: b.publishedAt,
      }))
    }

    return NextResponse.json({
      success: true,
      data: results,
      query: searchTerms,
    })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Arama yapılırken bir hata oluştu.', success: false },
      { status: 500 }
    )
  }
}
