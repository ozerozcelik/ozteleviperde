import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import authOptions from '@/lib/auth-options'

export async function requireAdmin() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Giriş yapmanız gerekiyor.' },
        { status: 401 }
      ),
    }
  }

  if (session.user.role !== 'admin') {
    return {
      ok: false as const,
      response: NextResponse.json(
        { success: false, error: 'Bu işlem için admin yetkisi gerekiyor.' },
        { status: 403 }
      ),
    }
  }

  return { ok: true as const, session }
}
