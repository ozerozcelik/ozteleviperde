import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ slug: string }>
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params

    const page = await db.contentPage.findUnique({
      where: { slug },
      select: {
        slug: true,
        title: true,
        seoTitle: true,
        seoDescription: true,
        heroTitle: true,
        heroSubtitle: true,
        heroImage: true,
        heroCtaText: true,
        heroCtaLink: true,
        sections: true,
        htmlContent: true,
        schemaJson: true,
        status: true,
        updatedAt: true,
      },
    })

    if (!page || page.status !== 'published') {
      return NextResponse.json({ success: true, data: null })
    }

    return NextResponse.json({ success: true, data: page })
  } catch (error) {
    console.error('Get public page error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfa icerigi yuklenirken bir hata olustu.' },
      { status: 500 }
    )
  }
}
