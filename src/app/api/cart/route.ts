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

// Get or create session ID for guest users
async function getSessionId(): Promise<string> {
  const cookieStore = await cookies()
  let sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

  if (!sessionId) {
    sessionId = generateSessionId()
  }

  return sessionId
}

async function getCurrentUserId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

// Get cart with items and product details
// GET /api/cart - Get current user's cart or session cart
export async function GET(request: NextRequest) {
  try {
    const userId = await getCurrentUserId()

    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    // Find cart by userId or sessionId
    let cart: any = null

    if (userId) {
      cart = await db.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          coupon: true,
        },
      })
    } else if (sessionId) {
      cart = await db.cart.findFirst({
        where: { sessionId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          coupon: true,
        },
      })
    }

    if (!cart) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'Sepet bulunamadı.',
      })
    }

    // Calculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    let discount = 0
    if (cart.coupon) {
      if (cart.coupon.type === 'percentage') {
        discount = subtotal * (cart.coupon.value / 100)
        if (cart.coupon.maxDiscount) {
          discount = Math.min(discount, cart.coupon.maxDiscount)
        }
      } else {
        discount = cart.coupon.value
      }
    }

    const total = subtotal - discount

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        subtotal,
        discount,
        total,
      },
    })
  } catch (error) {
    console.error('Get cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// POST /api/cart - Create new cart
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    await request.json().catch(() => null)
    const userId = await getCurrentUserId()

    const sessionId = await getSessionId()

    // Check if cart already exists
    let existingCart: any = null
    if (userId) {
      existingCart = await db.cart.findFirst({
        where: { userId },
      })
    } else {
      existingCart = await db.cart.findFirst({
        where: { sessionId },
      })
    }

    if (existingCart) {
      return NextResponse.json({
        success: true,
        data: existingCart,
        message: 'Sepet zaten mevcut.',
      })
    }

    // Create new cart
    const cart = await db.cart.create({
      data: {
        userId: userId || null,
        sessionId: userId ? null : sessionId,
      },
    })

    // Set session cookie for guest users
    if (!userId) {
      const cookieStore = await cookies()
      cookieStore.set(SESSION_ID_COOKIE, sessionId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    }

    return NextResponse.json({
      success: true,
      data: cart,
      message: 'Sepet oluşturuldu.',
    })
  } catch (error) {
    console.error('Create cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet oluşturulurken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// PUT /api/cart - Update cart (apply coupon)
export async function PUT(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const body = await request.json()
    const { cartId, couponId, action } = body
    const userId = await getCurrentUserId()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Sepet ID gerekli.' },
        { status: 400 }
      )
    }

    const existingCart = await db.cart.findUnique({
      where: { id: cartId },
      select: { id: true, userId: true, sessionId: true },
    })

    if (!existingCart) {
      return NextResponse.json(
        { success: false, error: 'Sepet bulunamadı.' },
        { status: 404 }
      )
    }

    const canAccess = userId
      ? existingCart.userId === userId
      : !!sessionId && existingCart.sessionId === sessionId

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Bu sepet için yetkiniz yok.' },
        { status: 403 }
      )
    }

    let updateData: { couponId?: string | null } = {}

    if (action === 'removeCoupon') {
      updateData = { couponId: null }
    } else if (couponId) {
      updateData = { couponId }
    }

    const cart = await db.cart.update({
      where: { id: cartId },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        coupon: true,
      },
    })

    // Recalculate totals
    const subtotal = cart.items.reduce((sum, item) => {
      return sum + item.price * item.quantity
    }, 0)

    let discount = 0
    if (cart.coupon) {
      if (cart.coupon.type === 'percentage') {
        discount = subtotal * (cart.coupon.value / 100)
        if (cart.coupon.maxDiscount) {
          discount = Math.min(discount, cart.coupon.maxDiscount)
        }
      } else {
        discount = cart.coupon.value
      }
    }

    const total = subtotal - discount

    return NextResponse.json({
      success: true,
      data: {
        ...cart,
        subtotal,
        discount,
        total,
      },
      message: 'Sepet güncellendi.',
    })
  } catch (error) {
    console.error('Update cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// DELETE /api/cart - Clear cart
export async function DELETE(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')
    const userId = await getCurrentUserId()
    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Sepet ID gerekli.' },
        { status: 400 }
      )
    }

    const existingCart = await db.cart.findUnique({
      where: { id: cartId },
      select: { id: true, userId: true, sessionId: true },
    })

    if (!existingCart) {
      return NextResponse.json(
        { success: false, error: 'Sepet bulunamadı.' },
        { status: 404 }
      )
    }

    const canAccess = userId
      ? existingCart.userId === userId
      : !!sessionId && existingCart.sessionId === sessionId

    if (!canAccess) {
      return NextResponse.json(
        { success: false, error: 'Bu sepet için yetkiniz yok.' },
        { status: 403 }
      )
    }

    // Delete all cart items
    await db.cartItem.deleteMany({
      where: { cartId },
    })

    // Remove coupon from cart
    await db.cart.update({
      where: { id: cartId },
      data: { couponId: null },
    })

    return NextResponse.json({
      success: true,
      message: 'Sepet temizlendi.',
    })
  } catch (error) {
    console.error('Clear cart error:', error)
    return NextResponse.json(
      { success: false, error: 'Sepet temizlenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
