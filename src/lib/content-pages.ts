export const MANAGED_PAGE_SLUGS = [
  { slug: 'anasayfa', title: 'Ana Sayfa', path: '/' },
  { slug: 'site-ayarlari', title: 'Genel Site Ayarlari', path: '/admin/site-ayarlari' },
  { slug: 'galeri', title: 'Galeri', path: '/galeri' },
  { slug: 'hakkimizda', title: 'Hakkimizda', path: '/hakkimizda' },
  { slug: 'koleksiyonlar', title: 'Ürünlerimiz', path: '/koleksiyonlar' },
  { slug: 'sikca-sorulan-sorular', title: 'Sikca Sorulan Sorular', path: '/sikca-sorulan-sorular' },
  { slug: 'visualizer', title: 'Perde Secim Asistani', path: '/visualizer' },
  { slug: 'giris', title: 'Giris', path: '/giris' },
  { slug: 'blog', title: 'Blog', path: '/blog' },
  { slug: 'favoriler', title: 'Favoriler', path: '/favoriler' },
  { slug: 'sepet', title: 'Sepet', path: '/sepet' },
] as const

export function routePathToSlug(pathname: string): string {
  if (pathname === '/') return 'anasayfa'
  return pathname.replace(/^\//, '')
}

export function slugToPath(slug: string): string {
  if (slug === 'anasayfa') return '/'
  if (slug === 'site-ayarlari') return '/admin'
  return `/${slug}`
}
