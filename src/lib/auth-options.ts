import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { db } from './db'
import { comparePassword } from './auth'

// Türkçe hata mesajları
const ERROR_MESSAGES: Record<string, string> = {
  CredentialsSignin: 'E-posta veya şifre hatalı',
  InvalidCredentials: 'Geçersiz kimlik bilgileri',
  UserNotFound: 'Kullanıcı bulunamadı',
  InvalidPassword: 'Şifre hatalı',
  EmailNotVerified: 'E-posta adresi doğrulanmamış',
  AccountLocked: 'Hesabınız kilitlenmiş',
  SessionRequired: 'Bu sayfayı görüntülemek için giriş yapmalısınız',
  Default: 'Bir hata oluştu, lütfen tekrar deneyin',
}

export function getErrorMessage(error: string): string {
  return ERROR_MESSAGES[error] || ERROR_MESSAGES.Default
}

const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'E-posta',
          type: 'email',
          placeholder: 'ornek@email.com',
        },
        password: {
          label: 'Şifre',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('E-posta ve şifre gereklidir')
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        })

        if (!user || !user.password) {
          throw new Error('E-posta veya şifre hatalı')
        }

        const isPasswordValid = await comparePassword(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('E-posta veya şifre hatalı')
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 gün
  },
  pages: {
    signIn: '/giris',
    error: '/giris',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.name = user.name
        token.email = user.email
        token.image = user.image
      }

      // Kullanıcı bilgilerini güncelleme
      if (trigger === 'update' && session) {
        token.name = session.name
        token.image = session.image
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.image as string
      }
      return session
    },
    async signIn({ user, account }) {
      if (account?.provider === 'credentials') {
        return true
      }
      return false
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`Kullanıcı giriş yaptı: ${user.email}`)
    },
    async signOut() {
      console.log('Kullanıcı çıkış yaptı')
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'oztelevi-secret-key-2024',
  debug: process.env.NODE_ENV === 'development',
}

export default authOptions
