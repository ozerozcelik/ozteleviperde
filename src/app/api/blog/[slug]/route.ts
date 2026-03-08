import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function parseStringArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

// Tek blog yazısı getir (slug ile)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const blog = await db.blog.findUnique({
      where: { slug },
    })

    if (!blog) {
      return NextResponse.json(
        { error: 'Blog yazısı bulunamadı.', success: false },
        { status: 404 }
      )
    }

    // Görüntülenme sayısını artır
    await db.blog.update({
      where: { slug },
      data: { viewCount: { increment: 1 } },
    })

    // JSON alanlarını parse et
    const parsedBlog = {
      ...blog,
      tags: parseStringArray(blog.tags),
      viewCount: blog.viewCount + 1, // Güncellenmiş sayıyı döndür
    }

    return NextResponse.json({
      success: true,
      data: parsedBlog,
    })
  } catch (error) {
    console.error('Get blog error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
