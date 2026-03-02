import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { hashPassword, isValidEmail, validatePassword } from '@/lib/auth'

// Use PrismaClient directly to avoid caching issues
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

// Debug: Log available models
console.log('Prisma client models:', Object.keys(prisma).filter(k => !k.startsWith('_') && !k.startsWith('$')))

export async function POST(request: NextRequest) {
  try {
    console.log('prisma.user exists:', !!prisma.user)
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
    const existingUser = await prisma.user.findUnique({
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
    const user = await prisma.user.create({
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

// Kullanıcı bilgisi kontrolü
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'E-posta parametresi gereklidir' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { exists: false },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { exists: true, user },
      { status: 200 }
    )
  } catch (error) {
    console.error('Kullanıcı sorgulama hatası:', error)
    return NextResponse.json(
      { error: 'Sorgulama sırasında bir hata oluştu' },
      { status: 500 }
    )
  }
}
