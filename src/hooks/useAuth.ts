'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface RegisterData {
  email: string
  password: string
  name?: string
}

export interface LoginData {
  email: string
  password: string
}

export interface AuthError {
  message: string
  field?: string
}

export function useAuth() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<AuthError | null>(null)

  const isLoading = status === 'loading'
  const isAuthenticated = status === 'authenticated'
  const isUnauthenticated = status === 'unauthenticated'

  // Giriş yap
  const login = useCallback(async (data: LoginData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      })

      if (result?.error) {
        setError({
          message: result.error === 'CredentialsSignin' 
            ? 'E-posta veya şifre hatalı' 
            : result.error,
        })
        setLoading(false)
        return false
      }

      if (result?.ok) {
        await update()
        setLoading(false)
        return true
      }

      setError({ message: 'Bilinmeyen bir hata oluştu' })
      setLoading(false)
      return false
    } catch (err) {
      setError({ message: 'Giriş sırasında bir hata oluştu' })
      setLoading(false)
      return false
    }
  }, [update])

  // Kayıt ol
  const register = useCallback(async (data: RegisterData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError({ message: result.error || 'Kayıt sırasında bir hata oluştu' })
        setLoading(false)
        return false
      }

      // Kayıt başarılı, giriş yap
      const loginSuccess = await login({
        email: data.email,
        password: data.password,
      })

      setLoading(false)
      return loginSuccess
    } catch (err) {
      setError({ message: 'Kayıt sırasında bir hata oluştu' })
      setLoading(false)
      return false
    }
  }, [login])

  // Çıkış yap
  const logout = useCallback(async (redirectUrl = '/') => {
    await signOut({ redirect: false })
    router.push(redirectUrl)
  }, [router])

  // Profil güncelle
  const updateProfile = useCallback(async (data: { name?: string; image?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        setError({ message: result.error || 'Profil güncellenemedi' })
        setLoading(false)
        return false
      }

      await update()
      setLoading(false)
      return true
    } catch (err) {
      setError({ message: 'Profil güncellenirken bir hata oluştu' })
      setLoading(false)
      return false
    }
  }, [update])

  // Şifre değiştir
  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError({ message: result.error || 'Şifre değiştirilemedi' })
        setLoading(false)
        return false
      }

      setLoading(false)
      return true
    } catch (err) {
      setError({ message: 'Şifre değiştirilirken bir hata oluştu' })
      setLoading(false)
      return false
    }
  }, [])

  // Hata temizle
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Admin kontrolü
  const isAdmin = session?.user?.role === 'admin'

  return {
    // Durum
    session,
    status,
    user: session?.user,
    isLoading,
    isAuthenticated,
    isUnauthenticated,
    loading,
    error,
    isAdmin,

    // İşlevler
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    clearError,
  }
}

export default useAuth
