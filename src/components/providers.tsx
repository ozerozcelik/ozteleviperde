'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { CartProvider } from '@/contexts/CartContext'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <FavoritesProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </FavoritesProvider>
    </SessionProvider>
  )
}
