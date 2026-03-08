import { NextResponse } from 'next/server'
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { requireAdmin } from '@/lib/api-auth'
import {
  cloudinary,
  getCloudinaryVariantUrls,
  getMediaStorageMode,
  getMediaStorageWarning,
  hasCloudinaryConfig,
  isProductionEnvironment,
} from '@/lib/media-storage'
import { buildMediaUsageMap, type MediaUsageRef } from '@/lib/media-usage'

export const runtime = 'nodejs'

interface MediaAsset {
  url: string
  publicId: string
  name: string
  createdAt: string
  folder?: string | null
  tags?: string[]
  width?: number | null
  height?: number | null
  bytes?: number | null
  usageCount?: number
  usedIn?: string[]
  usageRefs?: MediaUsageRef[]
  canDelete?: boolean
  variants?: {
    original: string
    thumb: string
    card: string
    gallery: string
    hero: string
  }
}

async function getLocalAssets() {
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  let files: string[] = []
  try {
    files = await readdir(uploadDir)
  } catch {
    return [] as MediaAsset[]
  }

  const assets: MediaAsset[] = []
  for (const name of files) {
    const fullPath = path.join(uploadDir, name)
    const fileStat = await stat(fullPath)
    if (!fileStat.isFile()) continue

    assets.push({
      url: `/uploads/${name}`,
      publicId: `local:${name}`,
      name,
      createdAt: fileStat.mtime.toISOString(),
      folder: 'public/uploads',
      variants: {
        original: `/uploads/${name}`,
        thumb: `/uploads/${name}`,
        card: `/uploads/${name}`,
        gallery: `/uploads/${name}`,
        hero: `/uploads/${name}`,
      },
    })
  }

  return assets.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 200)
}

async function getCloudinaryAssets() {
  const result = await cloudinary.api.resources({
    type: 'upload',
    prefix: 'oztelevi/',
    max_results: 200,
  }) as {
    resources?: Array<{
      secure_url: string
      public_id: string
      filename?: string
      created_at: string
      tags?: string[]
      width?: number
      height?: number
      bytes?: number
    }>
  }

  const resources = Array.isArray(result.resources) ? result.resources : []

  return resources
    .map((resource) => ({
      url: resource.secure_url,
      publicId: resource.public_id,
      name: resource.filename || resource.public_id.split('/').pop() || resource.public_id,
      createdAt: resource.created_at,
      folder: resource.public_id.includes('/') ? resource.public_id.split('/').slice(0, -1).join('/') : '',
      tags: Array.isArray(resource.tags) ? resource.tags : [],
      width: typeof resource.width === 'number' ? resource.width : null,
      height: typeof resource.height === 'number' ? resource.height : null,
      bytes: typeof resource.bytes === 'number' ? resource.bytes : null,
      variants: getCloudinaryVariantUrls(resource.public_id),
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export async function GET() {
  try {
    const auth = await requireAdmin()
    if (!auth.ok) return auth.response
    const usageMap = await buildMediaUsageMap()

    if (hasCloudinaryConfig()) {
      const data = (await getCloudinaryAssets()).map((asset) => {
        const candidateUrls = Array.from(
          new Set([
            asset.url,
            asset.variants?.thumb,
            asset.variants?.card,
            asset.variants?.gallery,
            asset.variants?.hero,
            asset.variants?.original,
          ].filter((value): value is string => typeof value === 'string' && value.length > 0))
        )
        const usageRefs = candidateUrls.flatMap((url) => usageMap.get(url) || []).filter((usage, index, all) =>
          all.findIndex((item) => item.label === usage.label && item.href === usage.href) === index
        )
        const usedIn = usageRefs.map((ref) => ref.label)
        return {
          ...asset,
          usageCount: usedIn.length,
          usedIn,
          usageRefs,
          canDelete: usedIn.length === 0,
        }
      })
      return NextResponse.json({
        success: true,
        data,
        storage: getMediaStorageMode(),
        persistent: true,
        warning: '',
      })
    }

    const data = (await getLocalAssets()).map((asset) => {
      const usageRefs = usageMap.get(asset.url) || []
      const usedIn = usageRefs.map((ref) => ref.label)
      return {
        ...asset,
        usageCount: usedIn.length,
        usedIn,
        usageRefs,
        canDelete: usedIn.length === 0,
      }
    })

    return NextResponse.json({
      success: true,
      data,
      storage: getMediaStorageMode(),
      persistent: !isProductionEnvironment(),
      warning: getMediaStorageWarning(),
    })
  } catch (error) {
    console.error('Get media library error:', error)
    return NextResponse.json(
      { success: false, error: 'Medya kutuphanesi yuklenemedi.' },
      { status: 500 }
    )
  }
}
