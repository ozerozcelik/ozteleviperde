import { createHash, randomBytes } from 'crypto'
import { db } from '@/lib/db'
import { SITE_URL } from '@/lib/site'

const PASSWORD_RESET_IDENTIFIER_PREFIX = 'password-reset:'
const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000
const RESEND_API_URL = 'https://api.resend.com/emails'

function getIdentifier(email: string) {
  return `${PASSWORD_RESET_IDENTIFIER_PREFIX}${email.toLowerCase().trim()}`
}

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function isPasswordResetEmailConfigured() {
  return Boolean(
    process.env.RESEND_API_KEY?.trim() &&
    process.env.PASSWORD_RESET_EMAIL_FROM?.trim()
  )
}

export function buildPasswordResetUrl(token: string) {
  return `${SITE_URL}/sifre-sifirla?token=${encodeURIComponent(token)}`
}

export async function createPasswordResetToken(email: string) {
  const normalizedEmail = email.toLowerCase().trim()
  const rawToken = randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)
  const identifier = getIdentifier(normalizedEmail)
  const expires = new Date(Date.now() + PASSWORD_RESET_TTL_MS)

  await db.verificationToken.deleteMany({
    where: {
      OR: [
        { identifier },
        { expires: { lt: new Date() } },
      ],
    },
  })

  await db.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires,
    },
  })

  return {
    rawToken,
    expires,
  }
}

export async function sendPasswordResetEmail(input: {
  email: string
  resetUrl: string
  name?: string | null
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  const from = process.env.PASSWORD_RESET_EMAIL_FROM?.trim()

  if (!apiKey || !from) {
    return {
      ok: false,
      reason: 'email_not_configured' as const,
    }
  }

  const greeting = input.name?.trim() || 'Merhaba'
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [input.email],
      subject: 'Şifre sıfırlama bağlantınız',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
          <p>${greeting},</p>
          <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın.</p>
          <p>
            <a href="${input.resetUrl}" style="display:inline-block;padding:12px 20px;background:#111827;color:#ffffff;text-decoration:none;border-radius:8px;">
              Şifreyi Sıfırla
            </a>
          </p>
          <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
          <p>Talep size ait değilse bu e-postayı yok sayabilirsiniz.</p>
          <p>Bağlantı çalışmazsa şu adresi tarayıcınıza yapıştırın:</p>
          <p><a href="${input.resetUrl}">${input.resetUrl}</a></p>
        </div>
      `,
      text: `${greeting},\n\nŞifrenizi sıfırlamak için bu bağlantıyı kullanın:\n${input.resetUrl}\n\nBağlantı 1 saat boyunca geçerlidir.`,
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const body = await response.text()
    console.error('Password reset email send failed:', response.status, body)
    return {
      ok: false,
      reason: 'email_send_failed' as const,
    }
  }

  return {
    ok: true,
  }
}

export async function consumePasswordResetToken(rawToken: string) {
  const token = rawToken.trim()

  if (!token) {
    return { ok: false as const, reason: 'invalid_token' as const }
  }

  const record = await db.verificationToken.findUnique({
    where: {
      token: hashToken(token),
    },
  })

  if (!record || !record.identifier.startsWith(PASSWORD_RESET_IDENTIFIER_PREFIX)) {
    return { ok: false as const, reason: 'invalid_token' as const }
  }

  if (record.expires < new Date()) {
    await db.verificationToken.delete({
      where: { token: record.token },
    }).catch(() => {})

    return { ok: false as const, reason: 'expired_token' as const }
  }

  const email = record.identifier.slice(PASSWORD_RESET_IDENTIFIER_PREFIX.length)

  return {
    ok: true as const,
    email,
    identifier: record.identifier,
    tokenHash: record.token,
  }
}

