import { db } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

// Admin kullanıcı bilgileri
const ADMIN_EMAIL = 'admin@oztelevi.com'
const ADMIN_PASSWORD = 'admin123' // Değiştirilmeli!
const ADMIN_NAME = 'ÖzTelevi Admin'

async function main() {
  console.log('🌱 Admin kullanıcı seed işlemi başlıyor...')

  // Mevcut admin kontrolü
  const existingAdmin = await db.user.findUnique({
    where: { email: ADMIN_EMAIL },
  })

  if (existingAdmin) {
    console.log('✅ Admin kullanıcı zaten mevcut:', existingAdmin.email)
    return
  }

  // Admin kullanıcısı oluştur
  const hashedPassword = await hashPassword(ADMIN_PASSWORD)

  const admin = await db.user.create({
    data: {
      email: ADMIN_EMAIL,
      password: hashedPassword,
      name: ADMIN_NAME,
      role: 'admin',
      emailVerified: new Date(),
    },
  })

  console.log('✅ Admin kullanıcı başarıyla oluşturuldu!')
  console.log('📧 E-posta:', admin.email)
  console.log('🔑 Şifre:', ADMIN_PASSWORD)
  console.log('⚠️  Lütfen şifreyi ilk girişten sonra değiştirin!')
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
