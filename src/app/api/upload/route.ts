import { NextRequest, NextResponse } from 'next/server'
import { mkdir, unlink, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { requireAdmin } from '@/lib/api-auth'
import {
  cloudinary,
  getCloudinaryVariantUrls,
  getMediaStorageWarning,
  hasCloudinaryConfig,
  isProductionEnvironment,
} from '@/lib/media-storage'
import { buildMediaUsageMap } from '@/lib/media-usage'

export const runtime = 'nodejs'

interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
}

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_UPLOAD_SIZE = 10 * 1024 * 1024

function getExtensionFromMime(type: string) {
  switch (type) {
    case 'image/jpeg':
      return 'jpg'
    case 'image/png':
      return 'png'
    case 'image/webp':
      return 'webp'
    case 'image/gif':
      return 'gif'
    default:
      return 'bin'
  }
}

async function uploadToLocal(file: File) {
  const ext = getExtensionFromMime(file.type)
  const fileName = `${Date.now()}-${randomUUID().slice(0, 8)}.${ext}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  const outputPath = path.join(uploadDir, fileName)

  await mkdir(uploadDir, { recursive: true })
  const bytes = await file.arrayBuffer()
  await writeFile(outputPath, Buffer.from(bytes))

  return {
    secure_url: `/uploads/${fileName}`,
    public_id: `local:${fileName}`,
  }
}

function parseTags(value: FormDataEntryValue | null): string[] {
  if (typeof value !== 'string') return []
  return value
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .slice(0, 20)
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const folderInput = formData.get('folder')
    const tags = parseTags(formData.get('tags'))
    const folder =
      typeof folderInput === 'string' && folderInput.trim().length > 0
        ? folderInput.trim().replace(/^\/+|\/+$/g, '')
        : 'oztelevi/general'

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi.' },
        { status: 400 }
      )
    }

    if (file.size > MAX_UPLOAD_SIZE) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz.' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPEG, PNG, WebP ve GIF dosyaları yüklenebilir.' },
        { status: 400 }
      )
    }

    if (!hasCloudinaryConfig() && isProductionEnvironment()) {
      return NextResponse.json(
        { error: getMediaStorageWarning() },
        { status: 503 }
      )
    }

    let result: CloudinaryUploadResult
    if (hasCloudinaryConfig()) {
      const bytes = await file.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      result = (await cloudinary.uploader.upload(dataUri, {
        folder,
        tags,
        transformation: [
          { width: 2000, height: 2000, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
      })) as CloudinaryUploadResult
    } else {
      result = await uploadToLocal(file)
    }

    return NextResponse.json({
      success: true,
      url: result.secure_url,
      publicId: result.public_id,
      storage: hasCloudinaryConfig() ? 'cloudinary' : 'local',
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    const { searchParams } = new URL(request.url)
    const publicId = searchParams.get('publicId')
    const assetUrl = searchParams.get('url')

    if (!publicId) {
      return NextResponse.json(
        { error: 'Public ID gerekli.' },
        { status: 400 }
      )
    }

    const usageMap = await buildMediaUsageMap()
    const potentialUrls = Array.from(
      new Set(
        [
          assetUrl,
          publicId.startsWith('local:') ? `/uploads/${publicId.replace('local:', '')}` : null,
          ...(!publicId.startsWith('local:') ? Object.values(getCloudinaryVariantUrls(publicId)) : []),
        ].filter((value): value is string => typeof value === 'string' && value.length > 0)
      )
    )

    const usedIn = potentialUrls.flatMap((url) => Array.from(usageMap.get(url) || []))
    if (usedIn.length > 0) {
      return NextResponse.json(
        {
          error: 'Bu gorsel sitede kullaniliyor. Once kullanim alanlarindan kaldirin.',
          usedIn: Array.from(new Set(usedIn)),
        },
        { status: 409 }
      )
    }

    if (publicId.startsWith('local:')) {
      const fileName = publicId.replace('local:', '')
      const filePath = path.join(process.cwd(), 'public', 'uploads', fileName)

      if (existsSync(filePath)) {
        await unlink(filePath)
      }
    } else if (hasCloudinaryConfig()) {
      await cloudinary.uploader.destroy(publicId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Cloudinary delete error:', error)
    return NextResponse.json(
      { error: 'Dosya silinirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response

    if (!hasCloudinaryConfig()) {
      return NextResponse.json(
        { success: false, error: 'Tag guncelleme yalnizca Cloudinary modunda desteklenir.' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const publicId = typeof body.publicId === 'string' ? body.publicId.trim() : ''
    const tags = Array.isArray(body.tags)
      ? body.tags.filter((tag: unknown): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean).slice(0, 20)
      : []

    if (!publicId) {
      return NextResponse.json(
        { success: false, error: 'Public ID gerekli.' },
        { status: 400 }
      )
    }

    await cloudinary.uploader.explicit(publicId, {
      type: 'upload',
      tags,
    })

    return NextResponse.json({ success: true, tags })
  } catch (error) {
    console.error('Cloudinary patch error:', error)
    return NextResponse.json(
      { success: false, error: 'Gorsel meta bilgileri guncellenemedi.' },
      { status: 500 }
    )
  }
}
