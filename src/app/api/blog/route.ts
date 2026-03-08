import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAdmin } from '@/lib/api-auth'

function parseStringArray(value: string | null): string[] {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch {
    return []
  }
}

// Blog yazılarını listele
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const category = searchParams.get('category')
    const featured = searchParams.get('featured')
    const published = searchParams.get('published')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Slug ile tek blog çek
    if (slug) {
      const blog = await db.blog.findUnique({
        where: { slug },
      })

      if (!blog) {
        return NextResponse.json(
          { error: 'Blog yazısı bulunamadı.', success: false },
          { status: 404 }
        )
      }

      // JSON alanlarını parse et
      const parsedBlog = {
        ...blog,
        tags: parseStringArray(blog.tags),
      }

      return NextResponse.json({
        success: true,
        data: parsedBlog,
      })
    }

    const where: Record<string, unknown> = {}

    if (category) {
      where.category = category
    }
    if (featured !== null) {
      where.featured = featured === 'true'
    }
    if (published !== null) {
      where.published = published === 'true'
    }

    const blogs = await db.blog.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      skip: offset,
    })

    const total = await db.blog.count({ where })

    // JSON alanlarını parse et
    const parsedBlogs = blogs.map((b) => ({
      ...b,
      tags: parseStringArray(b.tags),
    }))

    return NextResponse.json({
      success: true,
      data: parsedBlogs,
      pagination: {
        total,
        limit,
        offset,
      },
    })
  } catch (error) {
    console.error('Get blogs error:', error)
    return NextResponse.json(
      { error: 'Blog yazıları yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Yeni blog yazısı ekle (admin için)
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      image,
      author,
      tags,
      featured,
      published,
    } = body

    // Validasyon
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: 'Başlık, slug ve içerik zorunludur.' },
        { status: 400 }
      )
    }

    // Slug benzersiz mi kontrol et
    const existing = await db.blog.findUnique({
      where: { slug },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Bu slug zaten kullanılıyor. Farklı bir slug deneyiniz.' },
        { status: 400 }
      )
    }

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || null,
        category: category || null,
        image: image || null,
        author: author || null,
        tags: tags ? JSON.stringify(tags) : null,
        featured: featured || false,
        published: published || false,
        publishedAt: published ? new Date() : null,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla eklendi.',
      data: blog,
    })
  } catch (error) {
    console.error('Create blog error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı eklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Blog yazısı güncelle (admin için)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const body = await request.json()
    const { id, ...data } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID gerekli.' },
        { status: 400 }
      )
    }

    // JSON alanlarını string'e çevir
    const updateData: Record<string, unknown> = { ...data }
    if (data.tags) {
      updateData.tags = JSON.stringify(data.tags)
    }
    
    // Eğer published true olarak güncelleniyorsa ve daha önce published değilse
    if (data.published === true) {
      const existingBlog = await db.blog.findUnique({ where: { id } })
      if (existingBlog && !existingBlog.published) {
        updateData.publishedAt = new Date()
      }
    }

    const blog = await db.blog.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla güncellendi.',
      data: blog,
    })
  } catch (error) {
    console.error('Update blog error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı güncellenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

// Blog yazısı sil (admin için)
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID gerekli.' },
        { status: 400 }
      )
    }

    await db.blog.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Blog yazısı başarıyla silindi.',
    })
  } catch (error) {
    console.error('Delete blog error:', error)
    return NextResponse.json(
      { error: 'Blog yazısı silinirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
