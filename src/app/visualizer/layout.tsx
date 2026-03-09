import type { Metadata } from 'next'
import { toAbsoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: 'Perde Seçim Asistanı',
  description: 'Oda tipi, ışık ihtiyacı ve mahremiyet tercihlerinize göre size uygun perde yönünü belirleyen akıllı seçim asistanı.',
  openGraph: {
    title: 'Perde Seçim Asistanı | ÖzTelevi',
    description: 'Kısa bir yönlendirme akışı ile mekanınıza uygun perde yaklaşımını bulun.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: toAbsoluteUrl('/visualizer'),
  },
}

export default function VisualizerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
