import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'
import { MANAGED_PAGE_SLUGS, slugToPath } from '@/lib/content-pages'
import { getPageEditorPreset } from '@/lib/page-editor-presets'

interface RouteParams {
  params: Promise<{ slug: string }>
}

const pagePayloadSchema = z.object({
  title: z.string().trim().min(1, 'Baslik zorunludur.'),
  seoTitle: z.string().trim().max(255).optional().or(z.literal('')).nullable(),
  seoDescription: z.string().trim().max(500).optional().or(z.literal('')).nullable(),
  htmlContent: z.string().optional().or(z.literal('')).nullable(),
  schemaJson: z.string().optional().or(z.literal('')).nullable(),
  status: z.enum(['draft', 'published']).default('draft'),
  heroTitle: z.string().optional().or(z.literal('')).nullable(),
  heroSubtitle: z.string().optional().or(z.literal('')).nullable(),
  heroImage: z.string().optional().or(z.literal('')).nullable(),
  heroCtaText: z.string().optional().or(z.literal('')).nullable(),
  heroCtaLink: z.string().optional().or(z.literal('')).nullable(),
  sections: z.union([z.string(), z.array(z.unknown())]).optional().nullable(),
})

function normalizeOptionalString(value?: string | null) {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

function normalizeSections(
  sections: string | unknown[] | null | undefined
): { ok: true; value: string | null } | { ok: false; error: string } {
  if (!sections) {
    return { ok: true, value: null }
  }

  if (Array.isArray(sections)) {
    return { ok: true, value: JSON.stringify(sections) }
  }

  try {
    const parsed = JSON.parse(sections)
    if (!Array.isArray(parsed)) {
      return { ok: false, error: 'Bolumler JSON array olmali.' }
    }
    return { ok: true, value: JSON.stringify(parsed) }
  } catch {
    return { ok: false, error: 'Bolumler gecersiz JSON formatinda.' }
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { slug } = await params
    const managedPage = MANAGED_PAGE_SLUGS.find((entry) => entry.slug === slug)

    if (!managedPage) {
      return NextResponse.json(
        { success: false, error: 'Bu sayfa slug degeri desteklenmiyor.' },
        { status: 400 }
      )
    }

    await db.contentPage.upsert({
      where: { slug },
      create: {
        slug,
        title: managedPage.title,
        status: 'draft',
        updatedById: auth.session.user.id,
      },
      update: {},
    })

    const page = await db.contentPage.findUnique({
      where: { slug },
      include: {
        versions: {
          orderBy: { version: 'desc' },
          take: 20,
          select: {
            id: true,
            version: true,
            status: true,
            createdAt: true,
          },
        },
      },
    })

    if (!page) {
      return NextResponse.json(
        { success: false, error: 'Sayfa bulunamadi.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        page,
        baseline: getPageEditorPreset(slug),
      },
    })
  } catch (error) {
    console.error('Get admin page detail error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfa yuklenirken bir hata olustu.' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { slug } = await params
    const allowedSlugs = new Set<string>(MANAGED_PAGE_SLUGS.map((p) => p.slug))
    if (!allowedSlugs.has(slug)) {
      return NextResponse.json(
        { success: false, error: 'Bu sayfa slug degeri desteklenmiyor.' },
        { status: 400 }
      )
    }

    const rawBody = await request.json()
    const parsedBody = pagePayloadSchema.safeParse(rawBody)
    if (!parsedBody.success) {
      return NextResponse.json(
        { success: false, error: parsedBody.error.issues[0]?.message || 'Gecersiz veri.' },
        { status: 400 }
      )
    }

    const normalizedSections = normalizeSections(parsedBody.data.sections)
    if (!normalizedSections.ok) {
      return NextResponse.json(
        { success: false, error: normalizedSections.error },
        { status: 400 }
      )
    }

    const payload = parsedBody.data

    const page = await db.contentPage.upsert({
      where: { slug },
      create: {
        slug,
        title: payload.title,
        seoTitle: normalizeOptionalString(payload.seoTitle),
        seoDescription: normalizeOptionalString(payload.seoDescription),
        heroTitle: normalizeOptionalString(payload.heroTitle),
        heroSubtitle: normalizeOptionalString(payload.heroSubtitle),
        heroImage: normalizeOptionalString(payload.heroImage),
        heroCtaText: normalizeOptionalString(payload.heroCtaText),
        heroCtaLink: normalizeOptionalString(payload.heroCtaLink),
        sections: normalizedSections.value,
        htmlContent: normalizeOptionalString(payload.htmlContent),
        schemaJson: normalizeOptionalString(payload.schemaJson),
        status: payload.status,
        publishedAt: payload.status === 'published' ? new Date() : null,
        updatedById: auth.session.user.id,
      },
      update: {
        title: payload.title,
        seoTitle: normalizeOptionalString(payload.seoTitle),
        seoDescription: normalizeOptionalString(payload.seoDescription),
        heroTitle: normalizeOptionalString(payload.heroTitle),
        heroSubtitle: normalizeOptionalString(payload.heroSubtitle),
        heroImage: normalizeOptionalString(payload.heroImage),
        heroCtaText: normalizeOptionalString(payload.heroCtaText),
        heroCtaLink: normalizeOptionalString(payload.heroCtaLink),
        sections: normalizedSections.value,
        htmlContent: normalizeOptionalString(payload.htmlContent),
        schemaJson: normalizeOptionalString(payload.schemaJson),
        status: payload.status,
        publishedAt: payload.status === 'published' ? new Date() : null,
        updatedById: auth.session.user.id,
      },
    })

    const lastVersion = await db.contentPageVersion.findFirst({
      where: { pageId: page.id },
      orderBy: { version: 'desc' },
      select: { version: true },
    })

    await db.contentPageVersion.create({
      data: {
        pageId: page.id,
        version: (lastVersion?.version || 0) + 1,
        title: page.title,
        status: page.status,
        seoTitle: page.seoTitle,
        seoDescription: page.seoDescription,
        heroTitle: page.heroTitle,
        heroSubtitle: page.heroSubtitle,
        heroImage: page.heroImage,
        heroCtaText: page.heroCtaText,
        heroCtaLink: page.heroCtaLink,
        sections: page.sections,
        htmlContent: page.htmlContent,
        schemaJson: page.schemaJson,
        createdById: auth.session.user.id,
      },
    })

    revalidatePath(slugToPath(slug))

    return NextResponse.json({
      success: true,
      message:
        payload.status === 'published'
          ? 'Sayfa yayina alindi.'
          : 'Taslak kaydedildi.',
      data: page,
    })
  } catch (error) {
    console.error('Update admin page error:', error)
    return NextResponse.json(
      { success: false, error: 'Sayfa kaydedilirken bir hata olustu.' },
      { status: 500 }
    )
  }
}
