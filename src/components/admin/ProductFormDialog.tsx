'use client'

import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Upload, X } from 'lucide-react'
import MediaLibraryGrid from '@/components/admin/MediaLibraryGrid'
import type {
  MediaAsset,
  ProductFieldConfig,
  ProductFormState,
} from '@/components/admin/types'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingProduct: { id: string } | null
  isUploading: boolean
  uploadError: string
  mediaStorageMode: 'cloudinary' | 'local'
  mediaStorageWarning: string
  form: ProductFormState
  newFeature: string
  fields: ProductFieldConfig[]
  categorySuggestions: string[]
  mediaLibrary: MediaAsset[]
  isMediaLoading: boolean
  onRefreshMedia: () => void
  onDeleteMedia: (asset: MediaAsset) => void
  onUpdateMediaTags: (asset: MediaAsset, tags: string[]) => void
  onSelectMediaMain: (url: string) => void
  onSelectMediaGallery: (url: string) => void
  onFieldChange: (key: keyof ProductFormState, value: string | boolean) => void
  onAutoSlug: (name: string) => void
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>, isMultiple?: boolean) => void
  onRemoveImage: (index: number) => void
  onFeatureInputChange: (value: string) => void
  onAddFeature: () => void
  onRemoveFeature: (index: number) => void
  onSubmit: () => void
}

export default function ProductFormDialog({
  open,
  onOpenChange,
  editingProduct,
  isUploading,
  uploadError,
  mediaStorageMode,
  mediaStorageWarning,
  form,
  newFeature,
  fields,
  categorySuggestions,
  mediaLibrary,
  isMediaLoading,
  onRefreshMedia,
  onDeleteMedia,
  onUpdateMediaTags,
  onSelectMediaMain,
  onSelectMediaGallery,
  onFieldChange,
  onAutoSlug,
  onFileUpload,
  onRemoveImage,
  onFeatureInputChange,
  onAddFeature,
  onRemoveFeature,
  onSubmit,
}: ProductFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</DialogTitle>
          <DialogDescription>
            Ürün bilgilerini girin. * ile işaretli alanlar zorunludur.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-3 text-sm">
            <p className="font-medium text-stone-900">
              Medya depolama: {mediaStorageMode === 'cloudinary' ? 'Cloudinary' : 'Local fallback'}
            </p>
            {mediaStorageWarning && (
              <p className="mt-1 text-amber-700">{mediaStorageWarning}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {fields.map((field) => {
              if (field.type === 'toggle') {
                return (
                  <label
                    key={String(field.key)}
                    className="flex items-center gap-2 cursor-pointer border rounded-lg px-3 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(form[field.key] as boolean)}
                      onChange={(e) => onFieldChange(field.key, e.target.checked)}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{field.label}</span>
                  </label>
                )
              }

              if (field.type === 'select') {
                return (
                  <div key={String(field.key)} className="space-y-2">
                    <Label>{field.label}</Label>
                    <Select
                      value={String(form[field.key] ?? '')}
                      onValueChange={(value) => onFieldChange(field.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )
              }

              if (field.type === 'textarea') {
                return (
                  <div key={String(field.key)} className="space-y-2 md:col-span-2">
                    <Label>
                      {field.label}
                      {field.required ? ' *' : ''}
                    </Label>
                    <Textarea
                      value={String(form[field.key] ?? '')}
                      onChange={(e) => onFieldChange(field.key, e.target.value)}
                      rows={field.rows || 3}
                      required={field.required}
                    />
                  </div>
                )
              }

              return (
                <div key={String(field.key)} className="space-y-2">
                  <Label>
                    {field.label}
                    {field.required ? ' *' : ''}
                  </Label>
                  <Input
                    type={field.type}
                    list={field.key === 'category' ? 'product-category-suggestions' : undefined}
                    value={String(form[field.key] ?? '')}
                    onChange={(e) => {
                      onFieldChange(field.key, e.target.value)
                      if (field.autoSlug && !editingProduct) {
                        onAutoSlug(e.target.value)
                      }
                    }}
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                  {field.key === 'category' && categorySuggestions.length > 0 && (
                    <datalist id="product-category-suggestions">
                      {categorySuggestions.map((category) => (
                        <option key={category} value={category} />
                      ))}
                    </datalist>
                  )}
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <Label>Ana Görsel</Label>
            <div className="flex gap-4">
              {form.image ? (
                <div className="relative w-24 h-24 rounded-lg overflow-hidden">
                  <Image src={form.image} alt="Main" fill className="object-cover" />
                  <button
                    onClick={() => onFieldChange('image', '')}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <label className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
                  <Upload className="w-6 h-6 text-stone-400" />
                  <span className="text-xs text-stone-400 mt-1">Yükle</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => onFileUpload(e, false)}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Ek Görseller</Label>
            <div className="flex flex-wrap gap-3">
              {form.images.map((img, index) => (
                <div key={index} className="relative w-20 h-20 rounded-lg overflow-hidden">
                  <Image src={img} alt={`Image ${index + 1}`} fill className="object-cover" />
                  <button
                    onClick={() => onRemoveImage(index)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              <label className="w-20 h-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-stone-400 transition-colors">
                <Plus className="w-5 h-5 text-stone-400" />
                <span className="text-xs text-stone-400 mt-1">Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => onFileUpload(e, true)}
                  disabled={isUploading}
                />
              </label>
            </div>
            {uploadError && <p className="text-sm text-red-500">{uploadError}</p>}
          </div>

          <MediaLibraryGrid
            title="Medya Kutuphanesi"
            mediaLibrary={mediaLibrary}
            isMediaLoading={isMediaLoading}
            onRefresh={onRefreshMedia}
            onDelete={onDeleteMedia}
            onUpdateTags={onUpdateMediaTags}
            onSelectMain={onSelectMediaMain}
            onSelectGallery={onSelectMediaGallery}
            compact
          />

          <div className="space-y-2">
            <Label>Özellikler</Label>
            <div className="flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => onFeatureInputChange(e.target.value)}
                placeholder="Yeni özellik ekle..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), onAddFeature())}
              />
              <Button type="button" variant="outline" onClick={onAddFeature}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {form.features.map((feature, index) => (
                  <Badge key={index} variant="secondary" className="gap-1">
                    {feature}
                    <button onClick={() => onRemoveFeature(index)} className="ml-1 hover:text-red-500">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button onClick={onSubmit} disabled={isUploading}>
            {isUploading ? 'Yükleniyor...' : editingProduct ? 'Güncelle' : 'Ekle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
