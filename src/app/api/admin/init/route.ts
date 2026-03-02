import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// Admin kullanıcı bilgileri
const ADMIN_EMAIL = 'admin@oztelevi.com'
const ADMIN_PASSWORD = 'Admin123!' // Güvenli varsayılan şifre
const ADMIN_NAME = 'ÖzTelevi Admin'

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
    const body = await request.json()
    const { setupKey } = body

    // Basit güvenlik kontrolü
    // Gerçek uygulamada bu daha güvenli olmalı
    if (setupKey !== 'oztelevi-setup-2024') {
      return NextResponse.json(
        { error: 'Geçersiz kurulum anahtarı' },
        { status: 401 }
      )
    }

    // Mevcut admin kontrolü
    const existingAdmin = await db.user.findUnique({
      where: { email: ADMIN_EMAIL },
    })

    if (existingAdmin) {
      return NextResponse.json(
        { error: 'Admin kullanıcı zaten mevcut', email: ADMIN_EMAIL },
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
      defaultPassword: ADMIN_PASSWORD,
      warning: 'Lütfen ilk girişten sonra şifreyi değiştirin!',
    })
  } catch (error) {
    console.error('Admin oluşturma hatası:', error)
    return NextResponse.json(
      { error: 'Admin kullanıcı oluşturulamadı' },
      { status: 500 }
    )
  }
}
