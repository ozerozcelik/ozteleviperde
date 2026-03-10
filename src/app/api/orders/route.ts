import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'
import authOptions from '@/lib/auth-options'
import { enforceTrustedOrigin } from '@/lib/request-security'

interface OrderRequestItem {
  productId: string
  quantity: number
}

// ============================================
// Orders API - Admin Sipariş Yönetimi
// ============================================

// Siparişleri listele
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const search = searchParams.get('search')

    const where: Record<string, unknown> = {}

    if (status) {
      where.status = status
    }
    if (userId) {
      where.userId = userId
    }
    if (startDate) {
      where.createdAt = { ...where.createdAt as object, gte: new Date(startDate) }
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt as object, lte: new Date(endDate) }
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { billingName: { contains: search } },
        { billingEmail: { contains: search } },
      ]
    }

    const orders = await db.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            quantity: true,
            price: true,
            total: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    const total = await db.order.count({ where })

    // Toplam gelir (filtrelenmiş)
    const revenueStats = await db.order.aggregate({
      where: { ...where, status: { not: 'cancelled' } },
      _sum: { total: true },
    })

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit,
        offset,
      },
      stats: {
        totalRevenue: revenueStats._sum.total || 0,
      },
    })
  } catch (error) {
    console.error('Get orders error:', error)
    return NextResponse.json(
      { error: 'Siparişler yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Sipariş durumu güncelle
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, status, paymentStatus, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli.' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (notes !== undefined) updateData.notes = notes

    const order = await db.order.update({
      where: { id },
      data: updateData,
      include: {
        items: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Sipariş güncellendi.',
      data: order,
    })
  } catch (error) {
    console.error('Update order error:', error)
    return NextResponse.json(
      { error: 'Sipariş güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Sipariş oluştur (checkout)
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const session = await getServerSession(authOptions)
    const body = await request.json()
    const {
      billingName,
      billingEmail,
      billingPhone,
      billingAddress,
      billingCity,
      billingPostal,
      shippingName,
      shippingPhone,
      shippingAddress,
      shippingCity,
      shippingPostal,
      items,
      couponId,
      notes,
    } = body

    // Validasyon
    if (!billingName || !billingEmail || !billingPhone || !billingAddress || !billingCity) {
      return NextResponse.json(
        { error: 'Fatura bilgileri eksik.' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Sepet boş.' },
        { status: 400 }
      )
    }

    const orderItems = items as OrderRequestItem[]

    if (!orderItems.every((item) => item.productId && item.quantity > 0)) {
      return NextResponse.json(
        { error: 'Sipariş ürün bilgileri geçersiz.' },
        { status: 400 }
      )
    }

    const order = await db.$transaction(async (tx) => {
      const productIds = [...new Set(orderItems.map((item) => item.productId))]
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, price: true, stock: true, inStock: true },
      })

      const productMap = new Map(products.map((product) => [product.id, product]))

      const normalizedItems = orderItems.map((item) => {
        const product = productMap.get(item.productId)

        if (!product) {
          throw new Error('Ürün bulunamadı')
        }

        if (!product.inStock || product.stock < item.quantity) {
          throw new Error('Stokta yeterli ürün yok')
        }

        const lineTotal = product.price * item.quantity

        return {
          productId: product.id,
          productName: product.name,
          quantity: item.quantity,
          price: product.price,
          total: lineTotal,
        }
      })

      const subtotal = normalizedItems.reduce((sum: number, item: { total: number }) => sum + item.total, 0)

      let discount = 0
      let appliedCouponId: string | null = null

      if (couponId) {
        const coupon = await tx.coupon.findUnique({ where: { id: couponId } })
        const now = new Date()

        if (coupon && coupon.active) {
          const hasStarted = !coupon.startDate || now >= coupon.startDate
          const notExpired = !coupon.endDate || now <= coupon.endDate
          const hasUsage = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit
          const minAmountOk = !coupon.minAmount || subtotal >= coupon.minAmount

          if (hasStarted && notExpired && hasUsage && minAmountOk) {
            if (coupon.type === 'percentage') {
              discount = subtotal * (coupon.value / 100)
              if (coupon.maxDiscount) {
                discount = Math.min(discount, coupon.maxDiscount)
              }
            } else {
              discount = coupon.value
            }

            appliedCouponId = coupon.id

            await tx.coupon.update({
              where: { id: coupon.id },
              data: { usedCount: { increment: 1 } },
            })
          }
        }
      }

      const total = Math.max(subtotal - discount, 0)
      const orderNumber = `OZT-${new Date().getFullYear()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`

      const createdOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id || null,
          billingName,
          billingEmail,
          billingPhone,
          billingAddress,
          billingCity,
          billingPostal,
          shippingName: shippingName || billingName,
          shippingPhone: shippingPhone || billingPhone,
          shippingAddress: shippingAddress || billingAddress,
          shippingCity: shippingCity || billingCity,
          shippingPostal: shippingPostal || billingPostal,
          subtotal,
          discount,
          total,
          couponId: appliedCouponId,
          notes,
          status: 'pending',
          paymentStatus: 'pending',
          items: {
            create: normalizedItems,
          },
        },
        include: {
          items: true,
        },
      })

      for (const item of normalizedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        })
      }

      return createdOrder
    })

    return NextResponse.json({
      success: true,
      message: 'Sipariş oluşturuldu.',
      data: order,
    })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json(
      { error: 'Sipariş oluşturulurken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
