import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

const productCreateSchema = z.object({
  name: z.string().trim().min(1, 'Urun adi zorunludur.'),
  slug: z.string().trim().min(1, 'Slug zorunludur.'),
  description: z.string().trim().min(1, 'Aciklama zorunludur.'),
  price: z.union([z.number(), z.string()]),
  comparePrice: z.union([z.number(), z.string()]).optional().nullable(),
  currency: z.string().trim().default('TRY'),
  category: z.string().trim().min(1, 'Kategori zorunludur.'),
  image: z.string().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  features: z.array(z.string()).optional().nullable(),
  inStock: z.boolean().optional(),
  stock: z.union([z.number(), z.string()]).optional(),
  featured: z.boolean().optional(),
  order: z.number().optional(),
})

const productUpdateSchema = productCreateSchema.partial().extend({
  id: z.string().trim().min(1, 'Urun ID gerekli.'),
})

function toNumber(value: unknown) {
  if (typeof value === 'number') return value
  if (typeof value === 'string') return Number(value)
  return NaN
}

// Ürünleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // ID ile tek ürün çek
    if (id) {
      const product = await db.product.findUnique({
        where: { id },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Ürün bulunamadı.', success: false },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          ...product,
          images: product.images ? JSON.parse(product.images) : [],
          features: product.features ? JSON.parse(product.features) : [],
        },
      })
    }

    // Slug ile tek ürün çek
    if (slug) {
      const product = await db.product.findUnique({
        where: { slug },
      })

      if (!product) {
        return NextResponse.json(
          { error: 'Ürün bulunamadı.', success: false },
          { status: 404 }
        )
      }

      // JSON alanlarını parse et
      const parsedProduct = {
        ...product,
        images: product.images ? JSON.parse(product.images) : [],
        features: product.features ? JSON.parse(product.features) : [],
      }

      return NextResponse.json({
        success: true,
        data: parsedProduct,
      })
    }

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }
    if (featured !== null) {
      where.featured = featured === 'true'
    }
    if (inStock !== null) {
      where.inStock = inStock === 'true'
    }

    const products = await db.product.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    const total = await db.product.count({ where })

    // JSON alanlarını parse et
    const parsedProducts = products.map((p) => ({
      ...p,
      images: p.images ? JSON.parse(p.images) : [],
      features: p.features ? JSON.parse(p.features) : [],
    }))

    return NextResponse.json({
      success: true,
      data: parsedProducts,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get products error:', error)
    return NextResponse.json(
      { error: 'Ürünler yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Yeni ürün ekle (admin için)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const rawBody = await request.json()
    const parsedBody = productCreateSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || 'Gecersiz urun verisi.' },
        { status: 400 }
      )
    }

    const payload = parsedBody.data
    const parsedPrice = toNumber(payload.price)
    const parsedComparePrice =
      payload.comparePrice === undefined || payload.comparePrice === null || payload.comparePrice === ''
        ? null
        : toNumber(payload.comparePrice)
    const parsedStock =
      payload.stock === undefined ? 0 : Math.max(0, Math.trunc(toNumber(payload.stock)))

    if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json(
        { error: 'Fiyat alani gecersiz.' },
        { status: 400 }
      )
    }
    if (parsedComparePrice !== null && (Number.isNaN(parsedComparePrice) || parsedComparePrice < 0)) {
      return NextResponse.json(
        { error: 'Karsilastirma fiyati gecersiz.' },
        { status: 400 }
      )
    }
    if (Number.isNaN(parsedStock)) {
      return NextResponse.json(
        { error: 'Stok alani gecersiz.' },
        { status: 400 }
      )
    }

    // Slug benzersiz mi kontrol et
    const existing = await db.product.findUnique({
      where: { slug: payload.slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Farklı bir slug deneyiniz.' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        price: parsedPrice,
        comparePrice: parsedComparePrice,
        currency: payload.currency || 'TRY',
        category: payload.category,
        image: payload.image?.trim() ? payload.image.trim() : null,
        images: payload.images?.length ? JSON.stringify(payload.images) : null,
        features: payload.features?.length ? JSON.stringify(payload.features) : null,
        inStock: payload.inStock !== undefined ? payload.inStock : true,
        stock: parsedStock,
        featured: payload.featured || false,
        order: payload.order || 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla eklendi.',
      data: product,
    })
  } catch (error) {
    console.error('Create product error:', error)
    return NextResponse.json(
      { error: 'Ürün eklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Ürün güncelle (admin için)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const rawBody = await request.json()
    const parsedBody = productUpdateSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: parsedBody.error.issues[0]?.message || 'Gecersiz urun guncelleme verisi.' },
        { status: 400 }
      )
    }
    const { id, ...data } = parsedBody.data

    // JSON alanlarını string'e çevir
    const updateData: Record<string, unknown> = { ...data }
    if (data.images !== undefined) {
      updateData.images = data.images ? JSON.stringify(data.images) : null
    }
    if (data.features !== undefined) {
      updateData.features = data.features ? JSON.stringify(data.features) : null
    }
    if (data.price !== undefined) {
      const parsedPrice = toNumber(data.price)
      if (Number.isNaN(parsedPrice) || parsedPrice < 0) {
        return NextResponse.json(
          { error: 'Fiyat alani gecersiz.' },
          { status: 400 }
        )
      }
      updateData.price = parsedPrice
    }
    if (data.comparePrice !== undefined) {
      if (data.comparePrice === null || data.comparePrice === '') {
        updateData.comparePrice = null
      } else {
        const parsedComparePrice = toNumber(data.comparePrice)
        if (Number.isNaN(parsedComparePrice) || parsedComparePrice < 0) {
          return NextResponse.json(
            { error: 'Karsilastirma fiyati gecersiz.' },
            { status: 400 }
          )
        }
        updateData.comparePrice = parsedComparePrice
      }
    }
    if (data.stock !== undefined) {
      const parsedStock = toNumber(data.stock)
      if (Number.isNaN(parsedStock)) {
        return NextResponse.json(
          { error: 'Stok alani gecersiz.' },
          { status: 400 }
        )
      }
      updateData.stock = Math.max(0, Math.trunc(parsedStock))
    }

    const product = await db.product.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla güncellendi.',
      data: product,
    })
  } catch (error) {
    console.error('Update product error:', error)
    return NextResponse.json(
      { error: 'Ürün güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Ürün sil (admin için)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli.' },
        { status: 400 }
      )
    }

    await db.product.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün başarıyla silindi.',
    })
  } catch (error) {
    console.error('Delete product error:', error)
    return NextResponse.json(
      { error: 'Ürün silinirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
