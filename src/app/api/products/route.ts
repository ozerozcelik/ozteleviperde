import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Ürünleri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const inStock = searchParams.get('inStock')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

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
    const body = await request.json()
    const {
      name,
      slug,
      description,
      price,
      comparePrice,
      currency,
      category,
      image,
      images,
      features,
      inStock,
      stock,
      featured,
      order,
    } = body

    // Validasyon
    if (!name || !slug || !description || price === undefined || !category) {
      return NextResponse.json(
        { error: 'Ürün adı, slug, açıklama, fiyat ve kategori zorunludur.' },
        { status: 400 }
      )
    }

    // Slug benzersiz mi kontrol et
    const existing = await db.product.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Farklı bir slug deneyiniz.' },
        { status: 400 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        currency: currency || 'TRY',
        category,
        image: image || null,
        images: images ? JSON.stringify(images) : null,
        features: features ? JSON.stringify(features) : null,
        inStock: inStock !== undefined ? inStock : true,
        stock: stock !== undefined ? parseInt(stock) : 0,
        featured: featured || false,
        order: order || 0,
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
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli.' },
        { status: 400 }
      )
    }

    // JSON alanlarını string'e çevir
    const updateData: Record<string, unknown> = { ...data }
    if (data.images !== undefined) {
      updateData.images = data.images ? JSON.stringify(data.images) : null
    }
    if (data.features !== undefined) {
      updateData.features = data.features ? JSON.stringify(data.features) : null
    }
    if (data.price !== undefined) {
      updateData.price = parseFloat(data.price)
    }
    if (data.comparePrice !== undefined) {
      updateData.comparePrice = data.comparePrice ? parseFloat(data.comparePrice) : null
    }
    if (data.stock !== undefined) {
      updateData.stock = parseInt(data.stock) || 0
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
