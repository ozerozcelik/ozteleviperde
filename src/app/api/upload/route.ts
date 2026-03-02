import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

// Dosya yükleme API'si
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'Dosya seçilmedi.' },
        { status: 400 }
      )
    }

    // Dosya boyutu kontrolü (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Dosya boyutu 10MB\'dan büyük olamaz.' },
        { status: 400 }
      )
    }

    // Dosya türü kontrolü
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Sadece JPEG, PNG, WebP ve GIF dosyaları yüklenebilir.' },
        { status: 400 }
      )
    }

    // Benzersiz dosya adı oluştur
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const fileName = `${timestamp}-${randomStr}.${extension}`

    // Uploads klasörünün var olduğundan emin ol
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Dosyayı kaydet
    const filePath = path.join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Herkese açık URL'i döndür
    const imageUrl = `/uploads/${fileName}`

    return NextResponse.json({
      success: true,
      url: imageUrl,
      fileName: fileName,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Dosya yüklenirken bir hata oluştu.' },
      { status: 500 }
    )
  }
}
