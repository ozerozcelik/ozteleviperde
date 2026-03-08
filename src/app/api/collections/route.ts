import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

// Koleksiyonları listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Slug ile tek koleksiyon çek
    if (slug) {
      const collection = await db.collection.findUnique({
        where: { slug },
      })

      if (!collection) {
        return NextResponse.json(
          { error: 'Koleksiyon bulunamadı.', success: false },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: collection,
      })
    }

    const where: Record<string, unknown> = {}

    if (featured !== null) {
      where.featured = featured === 'true'
    }

    const collections = await db.collection.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    const total = await db.collection.count({ where })

    return NextResponse.json({
      success: true,
      data: collections,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get collections error:', error)
    return NextResponse.json(
      { error: 'Koleksiyonlar yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Yeni koleksiyon ekle (admin için)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { name, slug, description, image, featured, order } = body

    // Validasyon
    if (!name || !slug) {
      return NextResponse.json(
        { error: 'Koleksiyon adı ve slug zorunludur.' },
        { status: 400 }
      )
    }

    // Slug benzersiz mi kontrol et
    const existing = await db.collection.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Farklı bir slug deneyiniz.' },
        { status: 400 }
      )
    }

    const collection = await db.collection.create({
      data: {
        name,
        slug,
        description: description || null,
        image: image || null,
        featured: featured || false,
        order: order || 0,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Koleksiyon başarıyla eklendi.',
      data: collection,
    })
  } catch (error) {
    console.error('Create collection error:', error)
    return NextResponse.json(
      { error: 'Koleksiyon eklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Koleksiyon güncelle (admin için)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Koleksiyon ID gerekli.' },
        { status: 400 }
      )
    }

    const collection = await db.collection.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      message: 'Koleksiyon başarıyla güncellendi.',
      data: collection,
    })
  } catch (error) {
    console.error('Update collection error:', error)
    return NextResponse.json(
      { error: 'Koleksiyon güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Koleksiyon sil (admin için)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Koleksiyon ID gerekli.' },
        { status: 400 }
      )
    }

    await db.collection.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Koleksiyon başarıyla silindi.',
    })
  } catch (error) {
    console.error('Delete collection error:', error)
    return NextResponse.json(
      { error: 'Koleksiyon silinirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
