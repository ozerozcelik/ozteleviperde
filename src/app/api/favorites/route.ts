import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Favorileri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const guestId = searchParams.get('guestId')

    // Kullanıcı girişi yoksa guest ID ile favorileri getir
    const favorites = await db.favorite.findMany({
      where: userId ? { userId } : { userId: guestId || 'guest' },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            price: true,
            currency: true,
            category: true,
            image: true,
            inStock: true,
            featured: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      data: favorites.map((f) => ({
        id: f.id,
        productId: f.productId,
        product: f.product,
        createdAt: f.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get favorites error:', error)
    return NextResponse.json(
      { error: 'Favoriler yüklenirken bir hata oluştu.', success: false },
      { status: 500 }
    )
  }
}

// Favorilere ekle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, productId, guestId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli.', success: false },
        { status: 400 }
      )
    }

    const effectiveUserId = userId || guestId || 'guest'

    // Zaten favorilerde mi kontrol et
    const existing = await db.favorite.findFirst({
      where: {
        userId: effectiveUserId,
        productId,
      },
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Ürün zaten favorilerde.',
        data: existing,
        alreadyExists: true,
      })
    }

    // Favoriye ekle
    const favorite = await db.favorite.create({
      data: {
        userId: effectiveUserId,
        productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            image: true,
            price: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün favorilere eklendi.',
      data: favorite,
    })
  } catch (error) {
    console.error('Add favorite error:', error)
    return NextResponse.json(
      { error: 'Favorilere eklenirken bir hata oluştu.', success: false },
      { status: 500 }
    )
  }
}

// Favorilerden çıkar
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const productId = searchParams.get('productId')
    const favoriteId = searchParams.get('id')

    if (favoriteId) {
      // ID ile sil
      await db.favorite.delete({
        where: { id: favoriteId },
      })
    } else if (userId && productId) {
      // Kullanıcı ve ürün ID ile sil
      await db.favorite.deleteMany({
        where: {
          userId,
          productId,
        },
      })
    } else {
      return NextResponse.json(
        { error: 'Favori ID veya Kullanıcı ID ve Ürün ID gerekli.', success: false },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Ürün favorilerden çıkarıldı.',
    })
  } catch (error) {
    console.error('Delete favorite error:', error)
    return NextResponse.json(
      { error: 'Favorilerden çıkarılırken bir hata oluştu.', success: false },
      { status: 500 }
    )
  }
}
