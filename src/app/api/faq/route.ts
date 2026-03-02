import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// SSS'leri listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }
    if (active !== null) {
      where.active = active === 'true'
    } else {
      // Varsayılan olarak sadece aktif olanları getir
      where.active = true
    }

    const faqs = await db.fAQ.findMany({
      where,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    const total = await db.fAQ.count({ where })

    return NextResponse.json({
      success: true,
      data: faqs,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get FAQs error:', error)
    return NextResponse.json(
      { error: 'SSS yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Yeni SSS ekle (admin için)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { question, answer, category, order, active } = body

    // Validasyon
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Soru ve cevap zorunludur.' },
        { status: 400 }
      )
    }

    const faq = await db.fAQ.create({
      data: {
        question,
        answer,
        category: category || 'genel',
        order: order || 0,
        active: active !== undefined ? active : true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'SSS başarıyla eklendi.',
      data: faq,
    })
  } catch (error) {
    console.error('Create FAQ error:', error)
    return NextResponse.json(
      { error: 'SSS eklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// SSS güncelle (admin için)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'SSS ID gerekli.' },
        { status: 400 }
      )
    }

    const faq = await db.fAQ.update({
      where: { id },
      data,
    })

    return NextResponse.json({
      success: true,
      message: 'SSS başarıyla güncellendi.',
      data: faq,
    })
  } catch (error) {
    console.error('Update FAQ error:', error)
    return NextResponse.json(
      { error: 'SSS güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// SSS sil (admin için)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'SSS ID gerekli.' },
        { status: 400 }
      )
    }

    await db.fAQ.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'SSS başarıyla silindi.',
    })
  } catch (error) {
    console.error('Delete FAQ error:', error)
    return NextResponse.json(
      { error: 'SSS silinirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
