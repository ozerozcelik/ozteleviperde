import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import authOptions from '@/lib/auth-options'
import { enforceTrustedOrigin } from '@/lib/request-security'

// Favorileri listele
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json({ success: true, data: [] })
    }

    const favorites = await db.favorite.findMany({
      where: { userId },
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
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Favori işlemi için giriş yapmanız gerekiyor.', success: false },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { productId } = body

    if (!productId) {
      return NextResponse.json(
        { error: 'Ürün ID gerekli.', success: false },
        { status: 400 }
      )
    }

    // Zaten favorilerde mi kontrol et
    const existing = await db.favorite.findFirst({
      where: {
        userId,
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
        userId,
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
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return NextResponse.json(
        { error: 'Favori işlemi için giriş yapmanız gerekiyor.', success: false },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const favoriteId = searchParams.get('id')

    if (favoriteId) {
      // ID ile sil
      await db.favorite.deleteMany({
        where: { id: favoriteId, userId },
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
