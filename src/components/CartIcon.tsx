'use client'

import { useCart } from '@/contexts/CartContext'
import Link from 'next/link'

export function CartIcon() {
  const { itemCount, openDrawer } = useCart()

  return (
    <button
      onClick={openDrawer}
      className="relative p-2 text-foreground hover:text-muted-foreground transition-colors duration-300"
      aria-label={`Sepet (${itemCount} ürün)`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-6 h-6"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      {/* Count Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-foreground text-background text-xs font-medium rounded-full">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  )
}

// Compact version for mobile navigation
export function CartIconCompact() {
  const { itemCount } = useCart()

  return (
    <Link
      href="/sepet"
      className="relative p-2 text-foreground hover:text-muted-foreground transition-colors duration-300"
      aria-label={`Sepet (${itemCount} ürün)`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        className="w-5 h-5"
      >
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>

      {/* Count Badge */}
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center bg-foreground text-background text-[10px] font-medium rounded-full">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
    </Link>
  )
}
