import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'
import { enforceRateLimit, enforceTrustedOrigin } from '@/lib/request-security'

// İletişim formu gönderimi
export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const rateLimitError = await enforceRateLimit(request, {
      key: 'contact',
      limit: 6,
      windowMs: 10 * 60 * 1000,
    })
    if (rateLimitError) return rateLimitError

    const body = await request.json()
    const { name, email, phone, subject, message } = body

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
    const contact = await db.contact.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject: subject || null,
        message,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapacağız.',
      data: contact,
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Mesajınız gönderilirken bir hata oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    )
  }
}

// İletişim mesajlarını listele (admin için)
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = status ? { status } : {}

    const contacts = await db.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.contact.count({ where })

    return NextResponse.json({
      success: true,
      data: contacts,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get contacts error:', error)
    return NextResponse.json(
      { error: 'Mesajlar yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
