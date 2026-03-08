'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function ResetPasswordClient({ token }: { token: string }) {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!token) {
      setStatus('error')
      setMessage('Şifre sıfırlama bağlantısı eksik veya geçersiz.')
      return
    }

    if (password !== confirmPassword) {
      setStatus('error')
      setMessage('Şifreler birbiriyle uyuşmuyor.')
      return
    }

    setIsSubmitting(true)
    setStatus('idle')
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'Şifreniz güncellendi.')
        setPassword('')
        setConfirmPassword('')
        setTimeout(() => {
          router.push('/giris?reset=success')
        }, 1500)
      } else {
        setStatus('error')
        setMessage(data.error || 'Şifre güncellenemedi.')
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
      <div className="mx-auto max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Yeni Şifre Belirle</CardTitle>
            <CardDescription>
              Şifreniz en az 8 karakter olmalı ve büyük harf, küçük harf ile rakam içermelidir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!token ? (
              <div className="space-y-4 text-sm">
                <p className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-red-700">
                  Şifre sıfırlama bağlantısı eksik veya geçersiz.
                </p>
                <Link href="/sifremi-unuttum" className="text-foreground underline underline-offset-4">
                  Yeni bağlantı iste
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Yeni Şifre</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Yeni Şifre Tekrar</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
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
                  {isSubmitting ? 'Kaydediliyor...' : 'Şifreyi Güncelle'}
                </Button>

                <Link href="/giris" className="block text-center text-sm text-foreground underline underline-offset-4">
                  Giriş sayfasına dön
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
