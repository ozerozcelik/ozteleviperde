import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { cookies } from 'next/headers'
import authOptions from '@/lib/auth-options'
import { enforceTrustedOrigin } from '@/lib/request-security'

// POST /api/coupon - Validate and apply coupon code
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const session = await getServerSession(authOptions)
    const userId = session?.user?.id
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('cart_session_id')?.value

    const body = await request.json()
    const { code, cartId, subtotal } = body

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Kupon kodu gerekli.' },
        { status: 400 }
      )
    }

    // Find coupon by code
    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json(
        { success: false, error: 'Geçersiz kupon kodu.' },
        { status: 404 }
      )
    }

    // Check if coupon is active
    if (!coupon.active) {
      return NextResponse.json(
        { success: false, error: 'Bu kupon kodu artık geçerli değil.' },
        { status: 400 }
      )
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { success: false, error: 'Bu kupon kodu kullanım limitine ulaşmış.' },
        { status: 400 }
      )
    }

    // Check date range
    const now = new Date()
    if (coupon.startDate && now < coupon.startDate) {
      return NextResponse.json(
        { success: false, error: 'Bu kupon kodu henüz başlamamış.' },
        { status: 400 }
      )
    }
    if (coupon.endDate && now > coupon.endDate) {
      return NextResponse.json(
        { success: false, error: 'Bu kupon kodunun süresi dolmuş.' },
        { status: 400 }
      )
    }

    // Check minimum amount
    if (coupon.minAmount && subtotal && subtotal < coupon.minAmount) {
      return NextResponse.json(
        {
          success: false,
          error: `Bu kupon için minimum sepet tutarı ${coupon.minAmount.toLocaleString('tr-TR')} TL olmalıdır.`,
        },
        { status: 400 }
      )
    }

    // If cartId provided, apply coupon to cart
    if (cartId) {
      const cart = await db.cart.findUnique({
        where: { id: cartId },
        select: { id: true, userId: true, sessionId: true },
      })

      if (!cart) {
        return NextResponse.json(
          { success: false, error: 'Sepet bulunamadı.' },
          { status: 404 }
        )
      }

      const canAccess = userId
        ? cart.userId === userId
        : !!sessionId && cart.sessionId === sessionId

      if (!canAccess) {
        return NextResponse.json(
          { success: false, error: 'Bu sepet için yetkiniz yok.' },
          { status: 403 }
        )
      }

      await db.cart.update({
        where: { id: cartId },
        data: { couponId: coupon.id },
      })
    }

    // Calculate discount
    let discount = 0
    if (subtotal) {
      if (coupon.type === 'percentage') {
        discount = subtotal * (coupon.value / 100)
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount)
        }
      } else {
        discount = coupon.value
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        ...coupon,
        calculatedDiscount: discount,
      },
      message: 'Kupon kodu uygulandı.',
    })
  } catch (error) {
    console.error('Validate coupon error:', error)
    return NextResponse.json(
      { success: false, error: 'Kupon kodu doğrulanırken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
