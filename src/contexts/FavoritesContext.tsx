'use client'

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'

// ============================================
// Types
// ============================================
interface FavoriteProduct {
  id: string
  name: string
  slug: string
  description: string
  price: number
  currency: string
  category: string
  image: string | null
  inStock: boolean
  featured: boolean
}

interface Favorite {
  id: string
  productId: string
  product: FavoriteProduct
  createdAt: string
}

interface FavoritesContextType {
  favorites: Favorite[]
  favoriteIds: Set<string>
  isLoading: boolean
  addToFavorites: (productId: string) => Promise<void>
  removeFromFavorites: (productId: string) => Promise<void>
  toggleFavorite: (productId: string) => Promise<void>
  isFavorite: (productId: string) => boolean
  refreshFavorites: () => Promise<void>
  guestId: string
}

// ============================================
// Context
// ============================================
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const LOCAL_STORAGE_KEY = 'oztelevi_favorites'
const GUEST_ID_KEY = 'oztelevi_guest_id'

// ============================================
// Provider
// ============================================
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [guestId, setGuestId] = useState('')

  // Generate or get guest ID
  useEffect(() => {
    let storedGuestId = localStorage.getItem(GUEST_ID_KEY)
    if (!storedGuestId) {
      storedGuestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      localStorage.setItem(GUEST_ID_KEY, storedGuestId)
    }
    setGuestId(storedGuestId)
  }, [])

  // Load favorites from localStorage for guests
  const loadLocalFavorites = useCallback(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        setFavorites(parsed)
      }
    } catch (error) {
      console.error('Error loading local favorites:', error)
    }
  }, [])

  // Save favorites to localStorage
  const saveLocalFavorites = useCallback((favs: Favorite[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(favs))
    } catch (error) {
      console.error('Error saving local favorites:', error)
    }
  }, [])

  // Load favorites from API
  const refreshFavorites = useCallback(async () => {
    if (!guestId) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/favorites?guestId=${guestId}`)
      const data = await response.json()

      if (data.success && data.data) {
        setFavorites(data.data)
        saveLocalFavorites(data.data)
      } else {
        // If API fails, load from localStorage
        loadLocalFavorites()
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      // Load from localStorage as fallback
      loadLocalFavorites()
    } finally {
      setIsLoading(false)
    }
  }, [guestId, loadLocalFavorites, saveLocalFavorites])

  // Initial load
  useEffect(() => {
    if (guestId) {
      // First load from localStorage for instant display
      loadLocalFavorites()
      // Then sync with API
      refreshFavorites()
    }
  }, [guestId, loadLocalFavorites, refreshFavorites])

  // Add to favorites
  const addToFavorites = useCallback(async (productId: string) => {
    if (!guestId) return

    // Optimistic update
    const tempFavorite: Favorite = {
      id: `temp_${Date.now()}`,
      productId,
      product: {
        id: productId,
        name: '',
        slug: '',
        description: '',
        price: 0,
        currency: 'TRY',
        category: '',
        image: null,
        inStock: true,
        featured: false,
      },
      createdAt: new Date().toISOString(),
    }

    setFavorites((prev) => {
      const exists = prev.some((f) => f.productId === productId)
      if (exists) return prev
      const newFavs = [...prev, tempFavorite]
      saveLocalFavorites(newFavs)
      return newFavs
    })

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, guestId }),
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Update with real data from server
        setFavorites((prev) => {
          const filtered = prev.filter((f) => f.productId !== productId)
          const newFavs = [...filtered, data.data]
          saveLocalFavorites(newFavs)
          return newFavs
        })
      }
    } catch (error) {
      console.error('Error adding to favorites:', error)
    }
  }, [guestId, saveLocalFavorites])

  // Remove from favorites
  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!guestId) return

    // Optimistic update
    setFavorites((prev) => {
      const newFavs = prev.filter((f) => f.productId !== productId)
      saveLocalFavorites(newFavs)
      return newFavs
    })

    try {
      await fetch(`/api/favorites?guestId=${guestId}&productId=${productId}`, {
        method: 'DELETE',
      })
    } catch (error) {
      console.error('Error removing from favorites:', error)
    }
  }, [guestId, saveLocalFavorites])

  // Toggle favorite
  const toggleFavorite = useCallback(async (productId: string) => {
    const isFav = favorites.some((f) => f.productId === productId)
    if (isFav) {
      await removeFromFavorites(productId)
    } else {
      await addToFavorites(productId)
    }
  }, [favorites, addToFavorites, removeFromFavorites])

  // Check if product is favorite
  const isFavorite = useCallback((productId: string) => {
    return favorites.some((f) => f.productId === productId)
  }, [favorites])

  // Create a Set of favorite IDs for quick lookup
  const favoriteIds = new Set(favorites.map((f) => f.productId))

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        favoriteIds,
        isLoading,
        addToFavorites,
        removeFromFavorites,
        toggleFavorite,
        isFavorite,
        refreshFavorites,
        guestId,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

// ============================================
// Hook
// ============================================
export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
