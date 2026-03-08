import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/request-security'

// Admin kullanıcı bilgileri
const ADMIN_EMAIL = process.env.ADMIN_INIT_EMAIL
const ADMIN_PASSWORD = process.env.ADMIN_INIT_PASSWORD
const ADMIN_NAME = process.env.ADMIN_INIT_NAME || 'ÖzTelevi Admin'
const ADMIN_SETUP_KEY = process.env.ADMIN_SETUP_KEY

// GET - Admin durumunu kontrol et
export async function GET() {
  try {
    const adminCount = await db.user.count({
      where: { role: 'admin' },
    })

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
    })
  } catch (error) {
    console.error('Admin kontrol hatası:', error)
    return NextResponse.json(
      { error: 'Admin durumu kontrol edilemedi' },
      { status: 500 }
    )
  }
}

// POST - İlk admin kullanıcısını oluştur
export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await enforceRateLimit(request, {
      key: 'admin-init',
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })
    if (rateLimitError) return rateLimitError

    if (!ADMIN_SETUP_KEY || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      return NextResponse.json(
        { error: 'Admin init için gerekli ortam değişkenleri eksik.' },
        { status: 500 }
      )
    }

    const body = await request.json()
    const { setupKey } = body

    if (setupKey !== ADMIN_SETUP_KEY) {
      return NextResponse.json(
        { error: 'Geçersiz kurulum anahtarı' },
        { status: 401 }
      )
    }

    const existingAdminCount = await db.user.count({ where: { role: 'admin' } })

    if (existingAdminCount > 0) {
      return NextResponse.json(
        { error: 'Admin kullanıcı zaten mevcut' },
        { status: 400 }
      )
    }

    // Admin kullanıcısı oluştur
    const hashedPassword = await hashPassword(ADMIN_PASSWORD)

    const admin = await db.user.create({
      data: {
        email: ADMIN_EMAIL,
        password: hashedPassword,
        name: ADMIN_NAME,
        role: 'admin',
        emailVerified: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcı başarıyla oluşturuldu',
      admin: {
        email: admin.email,
        name: admin.name,
      },
      warning: 'Admin kullanıcı oluşturuldu.',
    })
  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Admin kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}
