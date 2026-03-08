import { createHmac, timingSafeEqual } from 'crypto'
import { toAbsoluteUrl } from '@/lib/site'

const NEWSLETTER_UNSUBSCRIBE_TTL_MS = 1000 * 60 * 60 * 24 * 90

type VerificationResult =
  | { ok: true; normalizedEmail: string }
  | { ok: false; reason: 'missing_secret' | 'missing_params' | 'expired' | 'invalid' }

function getNewsletterUnsubscribeSecret() {
  return (
    process.env.NEWSLETTER_UNSUBSCRIBE_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    ''
  )
}

function signPayload(normalizedEmail: string, expires: string) {
  return createHmac('sha256', getNewsletterUnsubscribeSecret())
    .update(`${normalizedEmail}:${expires}`)
    .digest('base64url')
}

export function createNewsletterUnsubscribeUrl(email: string) {
  const secret = getNewsletterUnsubscribeSecret()
  if (!secret) {
    return null
  }

  const normalizedEmail = email.toLowerCase().trim()
  const expires = String(Date.now() + NEWSLETTER_UNSUBSCRIBE_TTL_MS)
  const signature = signPayload(normalizedEmail, expires)
  const params = new URLSearchParams({
    email: normalizedEmail,
    expires,
    signature,
  })

  return toAbsoluteUrl(`/bulten/abonelikten-cik?${params.toString()}`)
}

export function verifyNewsletterUnsubscribeParams(input: {
  email?: string | null
  expires?: string | null
  signature?: string | null
}): VerificationResult {
  const secret = getNewsletterUnsubscribeSecret()
  if (!secret) {
    return { ok: false, reason: 'missing_secret' }
  }

  const normalizedEmail = input.email?.toLowerCase().trim()
  const expires = input.expires?.trim()
  const signature = input.signature?.trim()

  if (!normalizedEmail || !expires || !signature) {
    return { ok: false, reason: 'missing_params' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return { ok: false, reason: 'invalid' }
  }

  const expiresAt = Number(expires)
  if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
    return { ok: false, reason: 'expired' }
  }

  const expected = signPayload(normalizedEmail, expires)

  const providedBuffer = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return { ok: false, reason: 'invalid' }
  }

  return { ok: true, normalizedEmail }
}
