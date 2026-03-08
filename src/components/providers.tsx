'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import { CartProvider } from '@/contexts/CartContext'
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext'
import type { SiteSettings } from '@/lib/site-settings'

interface ProvidersProps {
  children: ReactNode
  siteSettings: SiteSettings
}

export function Providers({ children, siteSettings }: ProvidersProps) {
  return (
    <SiteSettingsProvider value={siteSettings}>
      <SessionProvider>
        <FavoritesProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </FavoritesProvider>
      </SessionProvider>
    </SiteSettingsProvider>
  )
}
