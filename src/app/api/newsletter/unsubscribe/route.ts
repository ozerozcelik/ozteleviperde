import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import {
  verifyNewsletterUnsubscribeParams,
} from '@/lib/newsletter-unsubscribe'
import { enforceRateLimit } from '@/lib/request-security'

async function deactivateSubscription(input: {
  email?: string | null
  expires?: string | null
  signature?: string | null
}) {
  const verification = verifyNewsletterUnsubscribeParams(input)

  if (!verification.ok) {
    return verification
  }

  await db.newsletter.updateMany({
    where: {
      email: verification.normalizedEmail,
      active: true,
    },
    data: {
      active: false,
    },
  })

  return verification
}

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await enforceRateLimit(request, {
      key: 'newsletter-unsubscribe',
      limit: 8,
      windowMs: 15 * 60 * 1000,
    })
    if (rateLimitError) return rateLimitError

    const body = await request.json()
    const result = await deactivateSubscription(body)

    if (!result.ok) {
      const status =
        result.reason === 'expired' ? 410 : result.reason === 'missing_secret' ? 500 : 400
      const message =
        result.reason === 'expired'
          ? 'Abonelik iptal bağlantısının süresi dolmuş.'
          : result.reason === 'missing_secret'
            ? 'Abonelik iptal sistemi yapılandırılmamış.'
            : 'Abonelik iptal bağlantısı geçersiz.'

      return NextResponse.json({ success: false, error: message }, { status })
    }

    return NextResponse.json({
      success: true,
      message: 'Bülten aboneliğiniz başarıyla iptal edildi.',
    })
  } catch (error) {
    console.error('Newsletter signed unsubscribe error:', error)
    return NextResponse.json(
      { success: false, error: 'Abonelik iptali sırasında bir hata oluştu.' },
      { status: 500 }
    )
  }
}
