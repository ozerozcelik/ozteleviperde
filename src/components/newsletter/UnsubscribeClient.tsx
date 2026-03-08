'use client'

import Link from 'next/link'
import { useState } from 'react'

type InitialState = 'valid' | 'expired' | 'invalid' | 'misconfigured'

export default function UnsubscribeClient({
  email,
  expires,
  signature,
  initialState,
}: {
  email: string
  expires: string
  signature: string
  initialState: InitialState
}) {
  const [status, setStatus] = useState<
    InitialState | 'submitting' | 'success' | 'error'
  >(initialState)

  const canSubmit = status === 'valid'

  const handleUnsubscribe = async () => {
    if (!canSubmit) return

    setStatus('submitting')

    try {
      const response = await fetch('/api/newsletter/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          expires,
          signature,
        }),
      })

      const data = await response.json().catch(() => null)

      if (response.ok && data?.success) {
        setStatus('success')
        return
      }

      setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  const content = {
    valid: {
      title: 'Bülten aboneliğini iptal et',
      description:
        'Artık e-posta almak istemiyorsanız aşağıdaki butonla aboneliğinizi güvenli şekilde iptal edebilirsiniz.',
      actionLabel: 'Aboneliği İptal Et',
    },
    submitting: {
      title: 'İşleniyor',
      description: 'Abonelik iptal isteğiniz işleniyor.',
      actionLabel: 'İşleniyor...',
    },
    success: {
      title: 'Abonelik iptal edildi',
      description: 'Artık bülten e-postaları gönderilmeyecek.',
      actionLabel: 'İptal Edildi',
    },
    expired: {
      title: 'Bağlantının süresi dolmuş',
      description:
        'Bu abonelik iptal bağlantısının süresi dolmuş. Yeni bir bağlantı istemeniz gerekir.',
      actionLabel: 'Süresi Doldu',
    },
    invalid: {
      title: 'Geçersiz bağlantı',
      description:
        'Abonelik iptal bağlantısı doğrulanamadı. Linki eksiksiz açtığınızdan emin olun.',
      actionLabel: 'Geçersiz',
    },
    misconfigured: {
      title: 'Sistem yapılandırılmamış',
      description:
        'Abonelik iptal sistemi henüz yapılandırılmamış. Lütfen site yöneticisiyle iletişime geçin.',
      actionLabel: 'Hazır Değil',
    },
    error: {
      title: 'İşlem tamamlanamadı',
      description:
        'Abonelik iptal işlemi sırasında bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
      actionLabel: 'Tekrar Dene',
    },
  }[status]

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-3xl border border-border bg-card p-8 shadow-sm">
        <p className="text-xs tracking-[0.3em] uppercase text-muted-foreground mb-4">
          ÖzTelevi Bülten
        </p>
        <h1 className="text-3xl font-light mb-4">{content.title}</h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          {content.description}
        </p>

        {canSubmit ? (
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm tracking-wide text-background transition hover:bg-foreground/90"
          >
            {content.actionLabel}
          </button>
        ) : status === 'error' ? (
          <button
            type="button"
            onClick={handleUnsubscribe}
            className="inline-flex items-center justify-center rounded-full bg-foreground px-6 py-3 text-sm tracking-wide text-background transition hover:bg-foreground/90"
          >
            {content.actionLabel}
          </button>
        ) : null}

        <div className="mt-8">
          <Link
            href="/"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    </main>
  )
}
