import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, validatePassword } from '@/lib/auth'
import { consumePasswordResetToken } from '@/lib/password-reset'
import { enforceRateLimit, enforceTrustedOrigin } from '@/lib/request-security'

export async function POST(request: NextRequest) {
  const originResponse = enforceTrustedOrigin(request)
  if (originResponse) return originResponse

  const rateLimitResponse = await enforceRateLimit(request, {
    key: 'reset-password',
    limit: 10,
    windowMs: 15 * 60 * 1000,
  })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const token = typeof body?.token === 'string' ? body.token : ''
    const password = typeof body?.password === 'string' ? body.password : ''

    const validation = validatePassword(password)
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errors[0] || 'Geçersiz şifre.' },
        { status: 400 }
      )
    }

    const tokenResult = await consumePasswordResetToken(token)
    if (!tokenResult.ok) {
      return NextResponse.json(
        {
          success: false,
          error:
            tokenResult.reason === 'expired_token'
              ? 'Şifre sıfırlama bağlantısının süresi dolmuş.'
              : 'Şifre sıfırlama bağlantısı geçersiz.',
        },
        { status: 400 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: tokenResult.email },
      select: { id: true },
    })

    if (!user) {
      await db.verificationToken.deleteMany({
        where: { identifier: tokenResult.identifier },
      })

      return NextResponse.json(
        { success: false, error: 'Kullanıcı bulunamadı.' },
        { status: 404 }
      )
    }

    const hashedPassword = await hashPassword(password)

    await db.$transaction([
      db.user.update({
        where: { id: user.id },
        data: {
          password: hashedPassword,
          emailVerified: new Date(),
        },
      }),
      db.session.deleteMany({
        where: { userId: user.id },
      }),
      db.verificationToken.deleteMany({
        where: {
          OR: [
            { identifier: tokenResult.identifier },
            { expires: { lt: new Date() } },
          ],
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      message: 'Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
    })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { success: false, error: 'Şifre güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
