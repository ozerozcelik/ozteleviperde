import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'

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

// Get cart with items and product details
// GET /api/cart - Get current user's cart or session cart
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    const cookieStore = await cookies()
    const sessionId = cookieStore.get(SESSION_ID_COOKIE)?.value

    // Find cart by userId or sessionId
    let cart = null

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
    const body = await request.json()
    const { userId } = body

    const sessionId = await getSessionId()

    // Check if cart already exists
    let existingCart = null
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
    const body = await request.json()
    const { cartId, couponId, action } = body

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Sepet ID gerekli.' },
        { status: 400 }
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
    const { searchParams } = new URL(request.url)
    const cartId = searchParams.get('cartId')

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: 'Sepet ID gerekli.' },
        { status: 400 }
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
