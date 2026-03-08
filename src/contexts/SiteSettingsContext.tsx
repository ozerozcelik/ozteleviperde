'use client'

import { createContext, useContext } from 'react'
import type { ReactNode } from 'react'
import type { SiteSettings } from '@/lib/site-settings'

const SiteSettingsContext = createContext<SiteSettings | null>(null)

export function SiteSettingsProvider({
  children,
  value,
}: {
  children: ReactNode
  value: SiteSettings
}) {
  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  )
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext)

  if (!context) {
    throw new Error('useSiteSettings must be used within SiteSettingsProvider')
  }

  return context
}
