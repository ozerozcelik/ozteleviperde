import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export type MediaStorageMode = 'cloudinary' | 'local'

export function hasCloudinaryConfig() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  )
}

export function isProductionEnvironment() {
  return process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production'
}

export function getMediaStorageMode(): MediaStorageMode {
  return hasCloudinaryConfig() ? 'cloudinary' : 'local'
}

export function getMediaStorageWarning() {
  if (hasCloudinaryConfig()) {
    return ''
  }

  if (isProductionEnvironment()) {
    return 'Cloudinary ayarlari eksik. Production ortaminda kalici ve sorunsuz medya yonetimi icin Cloudinary zorunludur.'
  }

  return 'Cloudinary ayarlari eksik. Gelistirme ortaminda dosyalar gecici olarak local public/uploads klasorune yazilir.'
}

export function getCloudinaryVariantUrls(publicId: string) {
  return {
    original: cloudinary.url(publicId, {
      secure: true,
    }),
    thumb: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 240, height: 180, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
    }),
    card: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 900, height: 1125, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
    }),
    gallery: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 1400, height: 1050, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
    }),
    hero: cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 1920, height: 1440, crop: 'fill', gravity: 'auto' }, { quality: 'auto', fetch_format: 'auto' }],
    }),
  }
}

export { cloudinary }
