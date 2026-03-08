'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { MediaAsset } from '@/components/admin/types'

interface MediaLibraryGridProps {
  title: string
  mediaLibrary: MediaAsset[]
  isMediaLoading: boolean
  onRefresh: () => void
  onDelete: (asset: MediaAsset) => void
  onUpdateTags?: (asset: MediaAsset, tags: string[]) => void
  onSelectMain?: (url: string) => void
  onSelectGallery?: (url: string) => void
  onSelectHero?: (url: string) => void
  compact?: boolean
}

export default function MediaLibraryGrid({
  title,
  mediaLibrary,
  isMediaLoading,
  onRefresh,
  onDelete,
  onUpdateTags,
  onSelectMain,
  onSelectGallery,
  onSelectHero,
  compact = false,
}: MediaLibraryGridProps) {
  const [query, setQuery] = useState('')
  const [editingPublicId, setEditingPublicId] = useState<string | null>(null)
  const [tagDraft, setTagDraft] = useState('')
  const filteredLibrary = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return mediaLibrary

    return mediaLibrary.filter((asset) => {
      const haystack = [
        asset.name,
        asset.folder || '',
        ...(asset.tags || []),
        ...(asset.usedIn || []),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [mediaLibrary, query])

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{title}</Label>
        <Button type="button" variant="outline" size="sm" onClick={onRefresh}>
          Yenile
        </Button>
      </div>
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Gorsel ara, etiket veya kullanim alani..."
      />
      {isMediaLoading ? (
        <p className="text-sm text-stone-500">Yukleniyor...</p>
      ) : filteredLibrary.length === 0 ? (
        <p className="text-sm text-stone-500">Kutuphane bos.</p>
      ) : (
        <div className={`grid gap-2 ${compact ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 md:grid-cols-4'}`}>
          {filteredLibrary.slice(0, compact ? 24 : 200).map((asset) => (
            <div key={asset.publicId} className="border rounded p-2 bg-white space-y-2">
              <div className="relative w-full h-20 rounded overflow-hidden">
                <img src={asset.variants?.thumb || asset.url} alt={asset.name} className="w-full h-full object-cover" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-stone-900 truncate" title={asset.name}>
                  {asset.name}
                </p>
                {asset.folder && (
                  <p className="text-[11px] text-stone-500 truncate" title={asset.folder}>
                    {asset.folder}
                  </p>
                )}
                <div className="flex flex-wrap gap-1 text-[11px]">
                  <span className={`rounded-full px-2 py-0.5 ${asset.usageCount ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-700'}`}>
                    {asset.usageCount ? `${asset.usageCount} kullanim` : 'Bosta'}
                  </span>
                  {asset.width && asset.height && (
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-600">
                      {asset.width}x{asset.height}
                    </span>
                  )}
                </div>
                {asset.tags && asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 4).map((tag) => (
                      <span key={tag} className="rounded-full bg-sky-50 px-2 py-0.5 text-[11px] text-sky-700">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {asset.usageRefs && asset.usageRefs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.usageRefs.slice(0, 3).map((usage) => (
                      <a
                        key={`${asset.publicId}-${usage.label}`}
                        href={usage.href}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-stone-600 underline-offset-2 hover:underline"
                        title={usage.href}
                      >
                        {usage.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
              {onUpdateTags && (
                <div className="space-y-1">
                  {editingPublicId === asset.publicId ? (
                    <>
                      <Input
                        value={tagDraft}
                        onChange={(event) => setTagDraft(event.target.value)}
                        placeholder="etiket1, etiket2"
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-7 text-[11px]"
                          onClick={() => {
                            onUpdateTags(
                              asset,
                              tagDraft
                                .split(',')
                                .map((tag) => tag.trim())
                                .filter(Boolean)
                            )
                            setEditingPublicId(null)
                          }}
                        >
                          Kaydet
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-7 text-[11px]"
                          onClick={() => setEditingPublicId(null)}
                        >
                          Vazgec
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 text-[11px]"
                      onClick={() => {
                        setEditingPublicId(asset.publicId)
                        setTagDraft((asset.tags || []).join(', '))
                      }}
                    >
                      Etiketler
                    </Button>
                  )}
                </div>
              )}
              <div className="flex flex-wrap gap-1">
                {onSelectHero && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => onSelectHero(asset.variants?.hero || asset.url)}
                  >
                    Hero
                  </Button>
                )}
                {onSelectMain && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectMain(asset.variants?.card || asset.url)}
                  >
                    Ana
                  </Button>
                )}
                {onSelectGallery && (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectGallery(asset.variants?.gallery || asset.url)}
                  >
                    Galeri
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={async () => {
                    await navigator.clipboard.writeText(asset.url)
                  }}
                >
                  URL
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-red-600"
                  disabled={asset.canDelete === false}
                  onClick={() => onDelete(asset)}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
