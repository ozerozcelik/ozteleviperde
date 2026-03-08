import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { isValidEmail } from '@/lib/auth'
import {
  buildPasswordResetUrl,
  createPasswordResetToken,
  isPasswordResetEmailConfigured,
  sendPasswordResetEmail,
} from '@/lib/password-reset'
import {
  enforceIdentifierRateLimit,
  enforceRateLimit,
  enforceTrustedOrigin,
} from '@/lib/request-security'

export async function POST(request: NextRequest) {
  const originResponse = enforceTrustedOrigin(request)
  if (originResponse) return originResponse

  const rateLimitResponse = await enforceRateLimit(request, {
    key: 'forgot-password',
    limit: 5,
    windowMs: 15 * 60 * 1000,
  })
  if (rateLimitResponse) return rateLimitResponse

  try {
    const body = await request.json()
    const normalizedEmail =
      typeof body?.email === 'string' ? body.email.toLowerCase().trim() : ''

    if (!isValidEmail(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Geçerli bir e-posta adresi girin.' },
        { status: 400 }
      )
    }

    const emailRateLimit = await enforceIdentifierRateLimit(
      `forgot-password:${normalizedEmail}`,
      {
        limit: 3,
        windowMs: 30 * 60 * 1000,
      }
    )

    if (!emailRateLimit.ok) {
      return NextResponse.json(
        {
          success: false,
          error: 'Aynı e-posta için çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.',
        },
        { status: 429 }
      )
    }

    if (!isPasswordResetEmailConfigured()) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Şifre sıfırlama e-postası şu anda otomatik gönderilemiyor. Lütfen destek ile iletişime geçin.',
          code: 'EMAIL_NOT_CONFIGURED',
        },
        { status: 503 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
      },
    })

    if (user) {
      const { rawToken } = await createPasswordResetToken(user.email)
      const resetUrl = buildPasswordResetUrl(rawToken)
      const delivery = await sendPasswordResetEmail({
        email: user.email,
        resetUrl,
        name: user.name,
      })

      if (!delivery.ok) {
        return NextResponse.json(
          {
            success: false,
            error:
              'Şifre sıfırlama e-postası gönderilemedi. Lütfen daha sonra tekrar deneyin.',
          },
          { status: 502 }
        )
      }
    }

    return NextResponse.json({
      success: true,
      message:
        'Bu e-posta ile kayıtlı bir hesap varsa şifre sıfırlama bağlantısı gönderildi.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'İşlem sırasında bir hata oluştu.',
      },
      { status: 500 }
    )
  }
}
