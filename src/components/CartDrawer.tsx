'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { CartItem } from '@/components/CartItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from '@/components/ui/sheet'

export function CartDrawer() {
  const {
    cart,
    isLoading,
    applyCoupon,
    removeCoupon,
    closeDrawer,
    isDrawerOpen,
  } = useCart()

  const [couponCode, setCouponCode] = useState('')
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
  const [couponMessage, setCouponMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

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

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    })
  }

  return (
    <Sheet open={isDrawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
        {/* Header */}
        <SheetHeader className="px-6 py-4 border-b border-border/50">
          <SheetTitle className="text-xl font-medium">
            Sepetim ({cart?.items.length || 0} ürün)
          </SheetTitle>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="w-16 h-16 text-muted-foreground/40 mb-4"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="text-muted-foreground mb-4">Sepetiniz boş</p>
              <SheetClose asChild>
                <Link
                  href="/galeri"
                  className="px-6 py-2.5 bg-foreground text-background text-sm rounded-full hover:bg-foreground/90 transition-colors"
                >
                  Alışverişe Başla
                </Link>
              </SheetClose>
            </div>
          ) : (
            <div className="space-y-1">
              {cart.items.map((item) => (
                <CartItem key={item.id} item={item} compact />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <SheetFooter className="border-t border-border/50 px-6 py-4 mt-auto">
            <div className="w-full space-y-4">
              {/* Coupon Input */}
              {!cart.coupon ? (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Kupon kodu"
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
                      className={`text-xs ${
                        couponMessage.type === 'success' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {couponMessage.text}
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
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
              )}

              {/* Totals */}
              <div className="space-y-2 text-sm">
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
                <div className="flex justify-between font-medium text-foreground text-base pt-2 border-t border-border/50">
                  <span>Toplam</span>
                  <span>{formatPrice(cart.total)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <SheetClose asChild>
                  <Link
                    href="/sepet"
                    className="w-full block text-center px-6 py-3 bg-foreground text-background text-sm rounded-full hover:bg-foreground/90 transition-colors"
                  >
                    Sepete Git
                  </Link>
                </SheetClose>
              </div>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}
