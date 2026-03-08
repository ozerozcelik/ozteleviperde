import { cache } from 'react'
import { db } from '@/lib/db'
import { getPageEditorPreset, type PageEditorSection } from '@/lib/page-editor-presets'

export type SiteSettings = {
  contact: {
    email: string
    phoneDisplay: string
    phoneHref: string
    whatsappPhone: string
    address: string
    addressLines: string[]
  }
  social: {
    instagram: string
    facebook: string
    pinterest: string
    whatsapp: string
    youtube: string
  }
  structuredData: {
    contactType: string
    priceRange: string
    openingHours: {
      weekdays: { opens: string; closes: string }
      saturday: { opens: string; closes: string }
    }
  }
}

const DEFAULT_CONTACT = {
  email: 'info@oztelevi.com',
  phoneDisplay: '+90 (212) 555 0123',
  address: 'Teşvikiye Mah., Bağdar Caddesi No:42, Şişli, İstanbul',
}

const DEFAULT_SOCIAL = {
  instagram: 'https://instagram.com/oztelevi',
  facebook: 'https://facebook.com/oztelevi',
  pinterest: 'https://pinterest.com/oztelevi',
  youtube: 'https://youtube.com/@oztelevi',
}

function parseSections(value: string | null | undefined): PageEditorSection[] {
  if (!value) return []

  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? (parsed as PageEditorSection[]) : []
  } catch {
    return []
  }
}

function findSectionByKey(sections: PageEditorSection[], key: string) {
  return sections.find((section) => (section.key || '').trim().toLowerCase() === key)
}

function toTelHref(phone: string) {
  const digits = phone.replace(/[^\d+]/g, '')
  return `tel:${digits}`
}

function toWhatsAppPhone(phone: string) {
  return phone.replace(/\D/g, '')
}

function toAddressLines(address: string) {
  const parts = address.split(',').map((part) => part.trim()).filter(Boolean)
  if (parts.length <= 1) {
    return [address]
  }

  return [parts.slice(0, 2).join(', '), parts.slice(2).join(', ')]
}

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  const homePreset = getPageEditorPreset('anasayfa')
  const presetContactItems = homePreset?.sections.find((section) => section.key === 'contact-cta')?.items || []
  const databaseUrl = process.env.DATABASE_URL ?? ''

  const canUseDatabase =
    databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://')

  const page = canUseDatabase
    ? await db.contentPage.findUnique({
        where: { slug: 'anasayfa' },
        select: {
          sections: true,
          status: true,
        },
      })
    : null

  const publishedSections =
    page?.status === 'published' ? parseSections(page.sections) : []
  const contactSection = findSectionByKey(publishedSections, 'contact-cta')
  const contactItems = contactSection?.items || presetContactItems

  const email = contactItems[0]?.trim() || DEFAULT_CONTACT.email
  const phoneDisplay = contactItems[1]?.trim() || DEFAULT_CONTACT.phoneDisplay
  const address = contactItems[2]?.trim() || DEFAULT_CONTACT.address
  const whatsappPhone = toWhatsAppPhone(phoneDisplay)

  return {
    contact: {
      email,
      phoneDisplay,
      phoneHref: toTelHref(phoneDisplay),
      whatsappPhone,
      address,
      addressLines: toAddressLines(address),
    },
    social: {
      ...DEFAULT_SOCIAL,
      whatsapp: `https://wa.me/${whatsappPhone}`,
    },
    structuredData: {
      contactType: 'customer service',
      priceRange: '$$',
      openingHours: {
        weekdays: {
          opens: '09:00',
          closes: '18:00',
        },
        saturday: {
          opens: '10:00',
          closes: '16:00',
        },
      },
    },
  }
})
