import type { Metadata } from 'next'
import { toAbsoluteUrl } from '@/lib/site'

export const metadata: Metadata = {
  title: '3D Görselleştirici',
  description: 'Oda görselleştirici ile perdelerinizi mekanınızda önizleyin. Farklı oda türleri, perde stilleri ve renk kombinasyonlarını keşfedin. Satın alma kararınızı kolaylaştırın.',
  openGraph: {
    title: '3D Görselleştirici | ÖzTelevi',
    description: 'Perdelerinizi mekanınızda önizleyin. Farklı kombinasyonları keşfedin.',
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
