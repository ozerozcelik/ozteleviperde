import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, isValidEmail, validatePassword } from '@/lib/auth'
import { enforceRateLimit, enforceTrustedOrigin } from '@/lib/request-security'

export async function POST(request: NextRequest) {
  try {
    const originError = enforceTrustedOrigin(request)
    if (originError) return originError

    const rateLimitError = await enforceRateLimit(request, {
      key: 'register',
      limit: 5,
      windowMs: 15 * 60 * 1000,
    })
    if (rateLimitError) return rateLimitError

    const body = await request.json()
    const { email, password, name } = body

    // Validasyonlar
    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-posta ve şifre gereklidir' },
        { status: 400 }
      )
    }

    // E-posta formatı kontrolü
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Geçerli bir e-posta adresi girin' },
        { status: 400 }
      )
    }

    // Şifre gücü kontrolü
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      )
    }

    // E-posta küçük harfe çevir
    const normalizedEmail = email.toLowerCase().trim()

    // Kullanıcı zaten var mı kontrol et
    const existingUser = await db.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await hashPassword(password)

    // Kullanıcı oluştur
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        name: name?.trim() || null,
        role: 'customer',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(
      {
        message: 'Hesabınız başarıyla oluşturuldu',
        user,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Kayıt sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
