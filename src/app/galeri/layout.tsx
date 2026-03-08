import type { Metadata } from 'next'
import { toAbsoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'ÖzTelevi galeri sayfası - Japandi tasarım ev tekstilleri ve perdelerden ilham alın. Yatak odası, salon ve çalışma odası için perde ve tekstil kombinasyonları.',
  openGraph: {
    title: 'Galeri | ÖzTelevi',
    description: 'Japandi tasarım ev tekstilleri ve perdelerden ilham alın.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: toAbsoluteUrl('/galeri'),
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
