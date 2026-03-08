import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'
import { MANAGED_PAGE_SLUGS } from '@/lib/content-pages'

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    for (const page of MANAGED_PAGE_SLUGS) {
      await db.contentPage.upsert({
        where: { slug: page.slug },
        create: {
          slug: page.slug,
          title: page.title,
          status: 'draft',
          updatedById: auth.session.user.id,
        },
        update: {},
      })
    }

    const pages = await db.contentPage.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        seoTitle: true,
        publishedAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: pages })
  } catch (error) {
    console.error('Get admin pages error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfalar yuklenirken bir hata olustu.' },
      { status: 500 }
    )
  }
}
