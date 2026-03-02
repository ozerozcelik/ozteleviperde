import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Bülten aboneliği
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, source } = body

    // Validasyon
    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi zorunludur.' },
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

    // Zaten abone mi kontrol et
    const existing = await db.newsletter.findUnique({
      where: { email },
    })

    if (existing) {
      if (existing.active) {
        return NextResponse.json({
          success: true,
          message: 'Bu e-posta adresi zaten bültenimize abone.',
        })
      } else {
        // Yeniden aktifleştir
        await db.newsletter.update({
          where: { email },
          data: { active: true, name: name || existing.name },
        })
        return NextResponse.json({
          success: true,
          message: 'Bülten aboneliğiniz yeniden aktifleştirildi.',
        })
      }
    }

    // Yeni abone kaydet
    const newsletter = await db.newsletter.create({
      data: {
        email,
        name: name || null,
        source: source || null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Bültenimize başarıyla abone oldunuz. Teşekkür ederiz!',
      data: newsletter,
    })
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'Abonelik işlemi sırasında bir hata oluştu. Lütfen tekrar deneyiniz.' },
      { status: 500 }
    )
  }
}

// Abonelikten çık
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta adresi gerekli.' },
        { status: 400 }
      )
    }

    await db.newsletter.update({
      where: { email },
      data: { active: false },
    })

    return NextResponse.json({
      success: true,
      message: 'Bülten aboneliğiniz iptal edildi.',
    })
  } catch (error) {
    console.error('Newsletter unsubscribe error:', error)
    return NextResponse.json(
      { error: 'Abonelik iptali sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Aboneleri listele (admin için)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = active !== null ? { active: active === 'true' } : {}

    const subscribers = await db.newsletter.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    })

    const total = await db.newsletter.count({ where })

    return NextResponse.json({
      success: true,
      data: subscribers,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get subscribers error:', error)
    return NextResponse.json(
      { error: 'Aboneler yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
