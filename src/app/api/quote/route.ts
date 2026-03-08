import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'
import { enforceRateLimit, enforceTrustedOrigin } from '@/lib/request-security'

// Teklif talebi gönderimi
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const rateLimitError = await enforceRateLimit(request, {
      key: 'quote',
      limit: 6,
      windowMs: 10 * 60 * 1000,
    })
    if (rateLimitError) return rateLimitError

    const body = await request.json()
    const { name, email, phone, productType, message } = body

    // Validasyon
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'İsim, e-posta ve mesaj alanları zorunludur.' },
        { status: 400 }
      )
    }

    // E-posta formatı kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      )
    }

    // Veritabanına kaydet
    const quoteRequest = await db.quoteRequest.create({
      data: {
        name,
        email,
        phone: phone || null,
        productType: productType || null,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Teklif talebiniz başarıyla alındı. Size en kısa sürede dönüş yapacağız.',
      data: quoteRequest,
    })
  } catch (error) {
    console.error('Quote request error:', error)
    return NextResponse.json(
      { error: 'Teklif talebi gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    )
  }
}

// Teklif taleplerini listele (admin için)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = status ? { status } : {}

    const quotes = await db.quoteRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.quoteRequest.count({ where })

    return NextResponse.json({
      success: true,
      data: quotes,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get quote requests error:', error)
    return NextResponse.json(
      { error: 'Teklif talepleri yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
