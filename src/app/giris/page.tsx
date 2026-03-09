'use client'

import { useState, useEffect } from 'react'
import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { signIn } from 'next-auth/react'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff, Mail, Lock, User, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import ManagedPage from '@/components/ManagedPage'
import ManagedPageLoading from '@/components/ManagedPageLoading'
import { usePageContent } from '@/hooks/usePageContent'
import { useSiteSettings } from '@/contexts/SiteSettingsContext'

function GirisPageContent() {
  const { content: managedPage, loading } = usePageContent('giris')
  const { legal, contact } = useSiteSettings()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { status } = useSession()
  const [activeTab, setActiveTab] = useState<'giris' | 'kayit'>('giris')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  // Login form state
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
  })

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/'
      router.push(callbackUrl)
    }
  }, [status, router, searchParams])

  // Get error from URL params (from NextAuth)
  useEffect(() => {
    const errorParam = searchParams.get('error')
    const resetParam = searchParams.get('reset')

    if (resetParam === 'success') {
      setSuccess('Şifreniz güncellendi. Yeni şifrenizle giriş yapabilirsiniz.')
      setError(null)
      return
    }

    if (errorParam) {
      setError('E-posta veya şifre hatalı')
    }
  }, [searchParams])

  if (loading && !managedPage) {
    return <ManagedPageLoading />
  }

  // Handle login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: loginForm.email.toLowerCase(),
        password: loginForm.password,
        redirect: false,
      })

      if (result?.error) {
        setError('E-posta veya şifre hatalı')
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        const callbackUrl = searchParams.get('callbackUrl') || '/'
        router.push(callbackUrl)
      }
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    // Validation
    if (registerForm.password !== registerForm.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (registerForm.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registerForm.email.toLowerCase(),
          password: registerForm.password,
          name: registerForm.name,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Kayıt sırasında bir hata oluştu')
        setIsLoading(false)
        return
      }

      setSuccess('Hesabınız başarıyla oluşturuldu! Giriş yapabilirsiniz.')
      setActiveTab('giris')
      setLoginForm({
        email: registerForm.email,
        password: '',
      })
      setRegisterForm({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      })
    } catch (err) {
      setError('Kayıt sırasında bir hata oluştu')
    } finally {
      setIsLoading(false)
    }
  }

  if (managedPage?.htmlContent || managedPage?.heroTitle) {
    return <ManagedPage 
      html={managedPage.htmlContent} 
      schemaJson={managedPage.schemaJson}
      heroTitle={managedPage.heroTitle}
      heroSubtitle={managedPage.heroSubtitle}
      heroImage={managedPage.heroImage}
      heroCtaText={managedPage.heroCtaText}
      heroCtaLink={managedPage.heroCtaLink}
      sections={managedPage.sections}
    />
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left Side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="/images/hero.png"
          alt="Güneş ışığıyla dolu salon"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/40 to-transparent" />
        
        {/* Decorative Elements */}
        <div className="absolute top-1/4 left-12 w-32 h-32 rounded-full bg-wood-200/30 blur-3xl animate-breathe" />
        <div className="absolute bottom-1/3 left-1/4 w-48 h-48 rounded-full bg-sage-200/30 blur-3xl animate-breathe" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-center p-16">
          <h2 className="text-4xl font-light text-foreground mb-4">
            Işığın Huzurla
            <br />
            <span className="font-normal italic">Buluştuğu Yer</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-md">
            ÖzTelevi ailesine katılın ve yaşam alanlarınıza huzur getiren 
            özel ürünlerimizden haberdar olun.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <Link href="/" className="hover:opacity-80 transition-opacity">
            <OzTeleviLogo />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Ana Sayfaya Dön
          </Link>
        </header>

        {/* Form Container */}
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-0 shadow-none bg-transparent">
            <CardHeader className="text-center p-0 mb-8">
              <CardTitle className="text-2xl font-light text-foreground">
                {activeTab === 'giris' ? (
                  <>
                    Hoş Geldiniz
                  </>
                ) : (
                  <>
                    Hesap Oluşturun
                  </>
                )}
              </CardTitle>
              <CardDescription className="text-muted-foreground mt-2">
                {activeTab === 'giris' 
                  ? 'Hesabınıza giriş yapın' 
                  : 'ÖzTelevi ailesine katılın'}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'giris' | 'kayit')}>
                <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50">
                  <TabsTrigger value="giris" className="data-[state=active]:bg-background">
                    Giriş Yap
                  </TabsTrigger>
                  <TabsTrigger value="kayit" className="data-[state=active]:bg-background">
                    Kayıt Ol
                  </TabsTrigger>
                </TabsList>

                {/* Login Tab */}
                <TabsContent value="giris">
                  <form onSubmit={handleLogin} className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="login-email">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="ornek@email.com"
                          className="pl-10"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password">Şifre</Label>
                        <Link
                          href="/sifremi-unuttum"
                          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          Şifremi Unuttum
                        </Link>
                      </div>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="login-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-10 pr-10"
                          value={loginForm.password}
                          onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Giriş Yapılıyor...
                        </>
                      ) : (
                        'Giriş Yap'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                {/* Register Tab */}
                <TabsContent value="kayit">
                  <form onSubmit={handleRegister} className="space-y-5">
                    {error && (
                      <Alert variant="destructive" className="mb-4">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    {success && (
                      <Alert className="mb-4 border-sage-400 bg-sage-50 text-sage-800">
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertDescription>{success}</AlertDescription>
                      </Alert>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="register-name">Adınız Soyadınız</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-name"
                          type="text"
                          placeholder="Adınız Soyadınız"
                          className="pl-10"
                          value={registerForm.name}
                          onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-email">E-posta</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="ornek@email.com"
                          className="pl-10"
                          value={registerForm.email}
                          onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-password">Şifre</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-password"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="En az 8 karakter"
                          className="pl-10 pr-10"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        En az 8 karakter, 1 büyük harf, 1 küçük harf ve 1 rakam içermelidir
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="register-confirm-password">Şifre Tekrar</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="register-confirm-password"
                          type="password"
                          placeholder="Şifrenizi tekrar girin"
                          className="pl-10"
                          value={registerForm.confirmPassword}
                          onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-foreground text-background hover:bg-foreground/90"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Kayıt Olunuyor...
                        </>
                      ) : (
                        'Kayıt Ol'
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Kayıt olarak{' '}
                      <Link href={legal.terms} className="underline hover:text-foreground">
                        Kullanım Şartları
                      </Link>{' '}
                      ve{' '}
                      <Link href={legal.privacy} className="underline hover:text-foreground">
                        Gizlilik Politikası
                      </Link>
                      &apos;nı kabul etmiş olursunuz.
                    </p>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </main>

        {/* Footer */}
        <footer className="p-6 text-center text-sm text-muted-foreground">
          <p>© 2024 ÖzTelevi. Tüm hakları saklıdır.</p>
        </footer>
      </div>
    </div>
  )
}

export default function GirisPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <GirisPageContent />
    </Suspense>
  )
}
