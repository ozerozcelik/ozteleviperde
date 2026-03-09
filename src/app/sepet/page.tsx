'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from '@/components/CartItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { OzTeleviLogo } from '@/components/OzTeleviLogo'
import { CartIcon } from '@/components/CartIcon'
import { CartDrawer } from '@/components/CartDrawer'
import ManagedPage from '@/components/ManagedPage'
import ManagedPageLoading from '@/components/ManagedPageLoading'
import { usePageContent } from '@/hooks/usePageContent'

export default function CartPage() {
  const { content: managedPage, loading } = usePageContent('sepet')
  const {
    cart,
    isLoading,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [isClearing, setIsClearing] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (loading && !managedPage) {
    return <ManagedPageLoading />
  }

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return

    setIsApplyingCoupon(true)
    setCouponMessage(null)

    const result = await applyCoupon(couponCode.trim())

    if (result.success) {
      setCouponMessage({ type: 'success', text: result.message })
      setCouponCode('')
    } else {
      setCouponMessage({ type: 'error', text: result.message })
    }

    setIsApplyingCoupon(false)
  }

  const handleRemoveCoupon = async () => {
    await removeCoupon()
    setCouponMessage(null)
  }

  const handleClearCart = async () => {
    if (window.confirm('Sepetinizdeki tüm ürünler silinecek. Emin misiniz?')) {
      setIsClearing(true)
      await clearCart()
      setIsClearing(false)
    }
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    })
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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-md shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <nav className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <OzTeleviLogo />

            <div className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Ana Sayfa
              </Link>
              <Link
                href="/galeri"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Galerimiz
              </Link>
              <CartIcon />
            </div>

            <div className="flex md:hidden items-center gap-4">
              <CartIcon />
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-28 pb-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-light text-foreground">
              Sepetim
            </h1>
            <p className="text-muted-foreground mt-2">
              {!isLoading && cart && cart.items.length > 0
                ? `${cart.items.length} ürün`
                : 'Sepetinizdeki ürünler'}
            </p>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            /* Empty Cart */
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="relative w-32 h-32 mb-6">
                <div className="absolute inset-0 bg-sand-100 rounded-full" />
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  className="absolute inset-0 w-full h-full p-6 text-muted-foreground/40"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-foreground mb-2">
                Sepetiniz boş
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Sepetinizde henüz ürün bulunmuyor. Koleksiyonumuzu keşfederek
                beğendiğiniz ürünleri sepete ekleyebilirsiniz.
              </p>
              <Link
                href="/galeri"
                className="px-8 py-3 bg-foreground text-background text-sm rounded-full hover:bg-foreground/90 transition-colors"
              >
                Alışverişe Başla
              </Link>
            </div>
          ) : (
            /* Cart Content */
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-card border border-border/50 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-border/50">
                    <h2 className="text-lg font-medium text-foreground">
                      Ürünler
                    </h2>
                    <button
                      onClick={handleClearCart}
                      disabled={isClearing}
                      className="text-sm text-red-600 hover:text-red-700 transition-colors disabled:opacity-50"
                    >
                      Sepeti Temizle
                    </button>
                  </div>

                  <div className="divide-y divide-border/50">
                    {cart.items.map((item) => (
                      <CartItem key={item.id} item={item} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border/50 rounded-2xl p-6 sticky top-28">
                  <h2 className="text-lg font-medium text-foreground mb-4">
                    Sipariş Özeti
                  </h2>

                  {/* Coupon Input */}
                  {!cart.coupon ? (
                    <div className="mb-6">
                      <label className="block text-sm text-muted-foreground mb-2">
                        Kupon Kodu
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          placeholder="Kupon kodunuz"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 uppercase"
                          maxLength={20}
                        />
                        <Button
                          variant="outline"
                          onClick={handleApplyCoupon}
                          disabled={isApplyingCoupon || !couponCode.trim()}
                        >
                          {isApplyingCoupon ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                          ) : (
                            'Uygula'
                          )}
                        </Button>
                      </div>
                      {couponMessage && (
                        <p
                          className={`text-xs mt-2 ${
                            couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {couponMessage.text}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {cart.coupon.code}
                          </p>
                          <p className="text-xs text-green-600">
                            {cart.coupon.type === 'percentage'
                              ? `%${cart.coupon.value} indirim`
                              : `${formatPrice(cart.coupon.value)} indirim`}
                          </p>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Kaldır
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="space-y-3 text-sm border-t border-border/50 pt-4">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Ara Toplam</span>
                      <span>{formatPrice(cart.subtotal)}</span>
                    </div>
                    {cart.discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>İndirim</span>
                        <span>-{formatPrice(cart.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Kargo</span>
                      <span>Ücretsiz</span>
                    </div>
                    <div className="flex justify-between font-medium text-foreground text-lg pt-3 border-t border-border/50">
                      <span>Toplam</span>
                      <span>{formatPrice(cart.total)}</span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full mt-6 py-6 text-base bg-foreground text-background hover:bg-foreground/90 rounded-full"
                    disabled
                  >
                    Siparişi Tamamla
                  </Button>
                  <p className="text-xs text-center text-muted-foreground mt-3">
                    Sipariş tamamlama özelliği yakında aktif edilecek
                  </p>

                  {/* Continue Shopping */}
                  <Link
                    href="/galeri"
                    className="block text-center text-sm text-muted-foreground hover:text-foreground transition-colors mt-4"
                  >
                    Alışverişe Devam Et
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-sand-50 py-12">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <OzTeleviLogo />
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                Ana Sayfa
              </Link>
              <Link href="/galeri" className="hover:text-foreground transition-colors">
                Galerimiz
              </Link>
              <Link href="/#iletisim" className="hover:text-foreground transition-colors">
                İletişim
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 ÖzTelevi. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      <CartDrawer />
    </div>
  )
}
