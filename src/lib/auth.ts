import bcrypt from 'bcryptjs'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { db } from './db'

// Şifre hashleme
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12)
  return bcrypt.hash(password, salt)
}

// Şifre karşılaştırma
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Oturum bilgisi alma
export async function getSession() {
  const { default: authOptions } = await import('./auth-options')
  return getServerSession(authOptions)
}

// Mevcut kullanıcı bilgisi alma
export async function getCurrentUser() {
  const session = await getSession()
  
  if (!session?.user?.email) {
    return null
  }
  
  const user = await db.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phone: true,
      createdAt: true,
    },
  })
  
  return user
}

// Kullanıcı admin mi kontrol et
export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser()
  return user?.role === 'admin'
}

// E-posta doğrulama
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Şifre gücü kontrolü
export function validatePassword(password: string): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('Şifre en az 8 karakter olmalıdır')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Şifre en az bir büyük harf içermelidir')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Şifre en az bir küçük harf içermelidir')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('Şifre en az bir rakam içermelidir')
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Admin kullanıcısı oluştur (ilk kurulum için)
export async function createAdminUser(
  email: string,
  password: string,
  name: string
) {
  const existingUser = await db.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor')
  }
  
  const hashedPassword = await hashPassword(password)
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: 'admin',
      emailVerified: new Date(),
    },
  })
  
  return user
}

// Normal kullanıcı oluştur
export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const existingUser = await db.user.findUnique({
    where: { email },
  })
  
  if (existingUser) {
    throw new Error('Bu e-posta adresi zaten kullanılıyor')
  }
  
  const hashedPassword = await hashPassword(password)
  
  const user = await db.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
      role: 'customer',
    },
  })
  
  return user
}
