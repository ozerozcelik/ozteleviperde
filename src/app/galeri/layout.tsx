import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Galeri',
  description: 'ÖzTelevi galeri sayfası - Japandi tasarım ev tekstilleri ve perdelerden ilham alın. Yatak odası, salon ve çalışma odası için perde ve tekstil kombinasyonları.',
  openGraph: {
    title: 'Galeri | ÖzTelevi',
    description: 'Japandi tasarım ev tekstilleri ve perdelerden ilham alın.',
    images: ['/images/og-image.png'],
  },
  alternates: {
    canonical: 'https://oztelevi.com/galeri',
  },
}

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
