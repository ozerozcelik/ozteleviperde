import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import authOptions from '@/lib/auth-options'
import { enforceTrustedOrigin } from '@/lib/request-security'

// Session ID cookie name
const SESSION_ID_COOKIE = 'cart_session_id'

// Generate a unique session ID
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

// POST /api/cart/item - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const body = await request.json()
    const { productId, quantity = 1, notes } = body
    const userId = await getCurrentUserId()

    if (!productId) {
      return NextResponse.json(
        { success: false, error: 'Ürün ID gerekli.' },
        { status: 400 }
      )
    }

    // Get product details
    const product = await db.product.findUnique({
      where: { id: productId },
    })

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Ürün bulunamadı.' },
        { status: 404 }
      )
    }

    if (!product.inStock || product.stock < 1) {
      return NextResponse.json(
        { success: false, error: 'Bu ürün stokta yok.' },
        { status: 400 }
      )
    }

    // Get or create session ID for guest users
    const cookieStore = await cookies()
    let sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    if (!sessionId && !userId) {
      sessionId = generateSessionId()
    }

    // Find or create cart
    let cart: any = null

    if (userId) {
      cart = await db.cart.findFirst({
        where: { userId },
      })
    } else if (sessionId) {
      cart = await db.cart.findFirst({
        where: { sessionId },
      })
    }

    if (!cart) {
      cart = await db.cart.create({
        data: {
          userId: userId || null,
          sessionId: userId ? null : sessionId,
        },
      })

      // Set session cookie for guest users
      if (!userId && sessionId) {
        cookieStore.set(SESSION_ID_COOKIE, sessionId, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 30, // 30 days
        })
      }
    }

    // Check if item already exists in cart
    const existingItem = await db.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    })

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + quantity
      if (product.stock && newQuantity > product.stock) {
        return NextResponse.json(
          { success: false, error: 'Stokta yeterli ürün yok.' },
          { status: 400 }
        )
      }

      const updatedItem = await db.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
        include: { product: true },
      })

      return NextResponse.json({
        success: true,
        data: updatedItem,
        message: 'Ürün miktarı güncellendi.',
      })
    }

    // Add new item
    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity,
        price: product.price,
        notes: notes || null,
      },
      include: { product: true },
    })

    return NextResponse.json({
      success: true,
      data: cartItem,
      message: 'Ürün sepete eklendi.',
    })
  } catch (error) {
    console.error('Add to cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürün sepete eklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// PUT /api/cart/item - Update item quantity
export async function PUT(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const body = await request.json()
    const { itemId, quantity } = body
    const userId = await getCurrentUserId()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { success: false, error: 'Ürün ID ve miktar gerekli.' },
        { status: 400 }
      )
    }

    if (quantity < 1) {
      return NextResponse.json(
        { success: false, error: 'Miktar en az 1 olmalı.' },
        { status: 400 }
      )
    }

    // Get cart item
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true, cart: true },
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Ürün sepette bulunamadı.' },
        { status: 404 }
      )
    }

    const canAccess = userId
      ? cartItem.cart.userId === userId
      : !!sessionId && cartItem.cart.sessionId === sessionId

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Bu sepet ürünü için yetkiniz yok.' },
        { status: 403 }
      )
    }

    // Check stock
    if (cartItem.product.stock && quantity > cartItem.product.stock) {
      return NextResponse.json(
        { success: false, error: 'Stokta yeterli ürün yok.' },
        { status: 400 }
      )
    }

    // Update quantity
    const updatedItem = await db.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true },
    })

    return NextResponse.json({
      success: true,
      data: updatedItem,
      message: 'Miktar güncellendi.',
    })
  } catch (error) {
    console.error('Update cart item error:', error)
    return NextResponse.json(
      { success: false, error: 'Miktar güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart/item - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')
    const userId = await getCurrentUserId()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: 'Ürün ID gerekli.' },
        { status: 400 }
      )
    }

    // Check if item exists
    const cartItem = await db.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true },
    })

    if (!cartItem) {
      return NextResponse.json(
        { success: false, error: 'Ürün sepette bulunamadı.' },
        { status: 404 }
      )
    }

    const canAccess = userId
      ? cartItem.cart.userId === userId
      : !!sessionId && cartItem.cart.sessionId === sessionId

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Bu sepet ürünü için yetkiniz yok.' },
        { status: 403 }
      )
    }

    // Delete item
    await db.cartItem.delete({
      where: { id: itemId },
    })

    return NextResponse.json({
      success: true,
      message: 'Ürün sepetten kaldırıldı.',
    })
  } catch (error) {
    console.error('Remove from cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Ürün sepetten kaldırılırken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
