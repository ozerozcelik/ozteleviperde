'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { CartItem as CartItemType } from '@/contexts/CartContext'
import { useCart } from '@/contexts/CartContext'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CartItemProps {
  item: CartItemType
  compact?: boolean
}

export function CartItem({ item, compact = false }: CartItemProps) {
  const { updateQuantity, removeItem, isLoading } = useCart()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (newQuantity: number) => {
    if (isUpdating || isLoading) return
    setIsUpdating(true)
    await updateQuantity(item.id, newQuantity)
    setIsUpdating(false)
  }

  const handleRemove = async () => {
    if (isUpdating || isLoading) return
    setIsUpdating(true)
    await removeItem(item.id)
    setIsUpdating(false)
  }

  const formatPrice = (price: number) => {
    return price.toLocaleString('tr-TR', {
      style: 'currency',
      currency: item.product.currency || 'TRY',
    })
  }

  if (compact) {
    return (
      <div className="flex gap-3 py-3 border-b border-border/50 last:border-0">
        {/* Product Image */}
        <Link href={`/urun/${item.product.slug}`} className="shrink-0">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-sand-100">
            {item.product.image ? (
              <Image
                src={item.product.image}
                alt={item.product.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <path d="M3 6h18" />
                </svg>
              </div>
            )}
          </div>
        </Link>

        {/* Product Info */}
        <div className="flex-1 min-w-0">
          <Link
            href={`/urun/${item.product.slug}`}
            className="text-sm font-medium text-foreground hover:text-muted-foreground line-clamp-1"
          >
            {item.product.name}
          </Link>
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-muted-foreground">
              {formatPrice(item.price)} × {item.quantity}
            </p>
            <p className="text-sm font-medium text-foreground">
              {formatPrice(item.price * item.quantity)}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-4 py-4 border-b border-border/50 last:border-0">
      {/* Product Image */}
      <Link href={`/urun/${item.product.slug}`} className="shrink-0">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-sand-100">
          {item.product.image ? (
            <Image
              src={item.product.image}
              alt={item.product.name}
              fill
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <path d="M3 6h18" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link
            href={`/urun/${item.product.slug}`}
            className="text-base font-medium text-foreground hover:text-muted-foreground transition-colors line-clamp-2"
          >
            {item.product.name}
          </Link>
          <button
            onClick={handleRemove}
            disabled={isUpdating || isLoading}
            className="p-1 text-muted-foreground hover:text-red-500 transition-colors disabled:opacity-50"
            aria-label="Ürünü kaldır"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-sm text-muted-foreground mt-1">
          {formatPrice(item.price)}
        </p>

        {/* Quantity Controls */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => handleQuantityChange(item.quantity - 1)}
              disabled={isUpdating || isLoading || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Azalt"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M5 12h14" />
              </svg>
            </button>
            <span
              className={cn(
                "w-10 text-center text-sm font-medium",
                isUpdating && "animate-pulse"
              )}
            >
              {item.quantity}
            </span>
            <button
              onClick={() => handleQuantityChange(item.quantity + 1)}
              disabled={isUpdating || isLoading || (item.product.stock && item.quantity >= item.product.stock)}
              className="w-8 h-8 flex items-center justify-center text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Artır"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          <p className="text-base font-medium text-foreground">
            {formatPrice(item.price * item.quantity)}
          </p>
        </div>

        {/* Stock Warning */}
        {item.product.stock && item.quantity >= item.product.stock && (
          <p className="text-xs text-orange-600 mt-2">
            Stok sınırına ulaşıldı
          </p>
        )}
      </div>
    </div>
  )
}
