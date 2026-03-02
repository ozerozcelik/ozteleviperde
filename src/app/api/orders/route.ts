import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// ============================================
// Orders API - Admin Sipariş Yönetimi
// ============================================

// Siparişleri listele
export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json()
    const { id, status, paymentStatus, trackingNumber, notes } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli.' },
        { status: 400 }
      )
    }

    const updateData: Record<string, unknown> = {}
    if (status) updateData.status = status
    if (paymentStatus) updateData.paymentStatus = paymentStatus
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber
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
    const body = await request.json()
    const {
      userId,
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
      subtotal,
      discount,
      total,
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

    // Sipariş numarası oluştur
    const orderCount = await db.order.count()
    const orderNumber = `OZT-${new Date().getFullYear()}-${String(orderCount + 1).padStart(5, '0')}`

    // Sipariş oluştur
    const order = await db.order.create({
      data: {
        orderNumber,
        userId: userId || null,
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
        discount: discount || 0,
        total,
        couponId: couponId || null,
        notes,
        status: 'pending',
        paymentStatus: 'pending',
        items: {
          create: items.map((item: { productId: string; productName: string; quantity: number; price: number; total: number }) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    // Stok düş
    for (const item of items) {
      await db.product.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
        },
      })
    }

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
