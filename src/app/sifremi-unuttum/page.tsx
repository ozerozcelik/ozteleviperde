'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

export default function ForgotPasswordPage() {
  const { contact } = useSiteSettings()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Şifre sıfırlama bağlantısı gönderildi.')
      } else {
        setStatus('error')
        setMessage(
          data.error ||
            'İşlem şu anda tamamlanamıyor. Lütfen daha sonra tekrar deneyin.'
        )
      }
    } catch {
      setStatus('error')
      setMessage('Bir bağlantı hatası oluştu. Lütfen tekrar deneyin.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-background px-6 py-16">
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Şifremi Unuttum</CardTitle>
            <CardDescription>
              Hesabınıza bağlı e-posta adresini girin. Bağlantı etkinse size sıfırlama bağlantısı gönderilir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="ornek@email.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              {status !== 'idle' && (
                <div
                  className={
                    status === 'success'
                      ? 'rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-700'
                      : 'rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700'
                  }
                >
                  {message}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alternatif Destek</CardTitle>
            <CardDescription>
              Otomatik e-posta servisi geçici olarak kullanılamıyorsa destek ekibi size yardımcı olabilir.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Destek e-postası:{' '}
              <a href={`mailto:${contact.email}`} className="text-foreground underline underline-offset-4">
                {contact.email}
              </a>
            </p>
            <p>
              Telefon:{' '}
              <a href={contact.phoneHref} className="text-foreground underline underline-offset-4">
                {contact.phoneDisplay}
              </a>
            </p>
            <Link href="/giris" className="inline-block text-foreground underline underline-offset-4">
              Giriş sayfasına dön
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
