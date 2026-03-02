'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'

// Types
export interface Product {
  id: string
  name: string
  slug: string
  description: string
  price: number
  comparePrice?: number | null
  currency: string
  category: string
  image: string | null
  inStock: boolean
  stock: number
  featured: boolean
}

export interface CartItem {
  id: string
  cartId: string
  productId: string
  product: Product
  quantity: number
  price: number
  notes?: string | null
}

export interface Coupon {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minAmount?: number | null
  maxDiscount?: number | null
}

export interface Cart {
  id: string
  userId?: string | null
  sessionId?: string | null
  items: CartItem[]
  coupon?: Coupon | null
  subtotal: number
  discount: number
  total: number
}

interface CartContextType {
  cart: Cart | null
  isLoading: boolean
  itemCount: number
  addItem: (productId: string, quantity?: number, notes?: string) => Promise<boolean>
  removeItem: (itemId: string) => Promise<boolean>
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>
  clearCart: () => Promise<boolean>
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>
  removeCoupon: () => Promise<boolean>
  refreshCart: () => Promise<void>
  isDrawerOpen: boolean
  openDrawer: () => void
  closeDrawer: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

// Local storage key for guest cart
const GUEST_CART_KEY = 'oztelevi_guest_cart'

interface GuestCartItem {
  productId: string
  quantity: number
  price: number
  product: Product
}

interface GuestCart {
  items: GuestCartItem[]
  couponCode?: string
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isGuestMode, setIsGuestMode] = useState(true)

  // Calculate item count
  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  // Load cart from localStorage for guests
  const loadGuestCart = useCallback(() => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY)
      if (stored) {
        const guestCart: GuestCart = JSON.parse(stored)
        // Convert guest cart to Cart format
        const items: CartItem[] = guestCart.items.map((item, index) => ({
          id: `guest-item-${index}`,
          cartId: 'guest-cart',
          productId: item.productId,
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        }))

        const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
        let discount = 0

        setCart({
          id: 'guest-cart',
          items,
          coupon: null,
          subtotal,
          discount,
          total: subtotal - discount,
        })
      }
    } catch (error) {
      console.error('Load guest cart error:', error)
    }
  }, [])

  // Save cart to localStorage for guests
  const saveGuestCart = useCallback((items: GuestCartItem[], couponCode?: string) => {
    try {
      const guestCart: GuestCart = { items, couponCode }
      localStorage.setItem(GUEST_CART_KEY, JSON.stringify(guestCart))
    } catch (error) {
      console.error('Save guest cart error:', error)
    }
  }, [])

  // Refresh cart from API or localStorage
  const refreshCart = useCallback(async () => {
    setIsLoading(true)
    try {
      // Try to fetch from API first
      const res = await fetch('/api/cart')
      const data = await res.json()

      if (data.success && data.data) {
        setCart(data.data)
        setIsGuestMode(false)
      } else {
        // Load from localStorage for guests
        loadGuestCart()
        setIsGuestMode(true)
      }
    } catch (error) {
      console.error('Refresh cart error:', error)
      // Fallback to localStorage
      loadGuestCart()
      setIsGuestMode(true)
    } finally {
      setIsLoading(false)
    }
  }, [loadGuestCart])

  // Load cart on mount
  useEffect(() => {
    refreshCart()
  }, [refreshCart])

  // Add item to cart
  const addItem = useCallback(
    async (productId: string, quantity = 1, notes?: string): Promise<boolean> => {
      try {
        // If guest mode, fetch product first and store locally
        if (isGuestMode) {
          // Fetch product details
          const productRes = await fetch(`/api/products?slug=${productId}`)
          let product = null

          if (productRes.ok) {
            const productData = await productRes.json()
            product = productData.data
          } else {
            // Try by ID
            const allProductsRes = await fetch('/api/products')
            if (allProductsRes.ok) {
              const allProductsData = await allProductsRes.json()
              product = allProductsData.data?.find((p: Product) => p.id === productId)
            }
          }

          if (!product) {
            console.error('Product not found')
            return false
          }

          // Update local cart
          const currentItems: GuestCartItem[] = cart?.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: item.product,
          })) || []

          const existingIndex = currentItems.findIndex((item) => item.productId === productId)

          if (existingIndex >= 0) {
            currentItems[existingIndex].quantity += quantity
          } else {
            currentItems.push({
              productId,
              quantity,
              price: product.price,
              product,
            })
          }

          saveGuestCart(currentItems, cart?.coupon?.code)
          await refreshCart()
          return true
        }

        // API mode for logged-in users
        const res = await fetch('/api/cart/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, quantity, notes }),
        })

        const data = await res.json()
        if (data.success) {
          await refreshCart()
          return true
        }
        return false
      } catch (error) {
        console.error('Add item error:', error)
        return false
      }
    },
    [cart, isGuestMode, refreshCart, saveGuestCart]
  )

  // Remove item from cart
  const removeItem = useCallback(
    async (itemId: string): Promise<boolean> => {
      try {
        if (isGuestMode) {
          const currentItems = cart?.items || []
          const updatedItems = currentItems.filter((item) => item.id !== itemId)

          const guestItems: GuestCartItem[] = updatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: item.product,
          }))

          saveGuestCart(guestItems, cart?.coupon?.code)
          await refreshCart()
          return true
        }

        const res = await fetch(`/api/cart/item?itemId=${itemId}`, {
          method: 'DELETE',
        })

        const data = await res.json()
        if (data.success) {
          await refreshCart()
          return true
        }
        return false
      } catch (error) {
        console.error('Remove item error:', error)
        return false
      }
    },
    [cart, isGuestMode, refreshCart, saveGuestCart]
  )

  // Update item quantity
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number): Promise<boolean> => {
      try {
        if (quantity < 1) return false

        if (isGuestMode) {
          const currentItems = cart?.items || []
          const updatedItems = currentItems.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          )

          const guestItems: GuestCartItem[] = updatedItems.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: item.product,
          }))

          saveGuestCart(guestItems, cart?.coupon?.code)
          await refreshCart()
          return true
        }

        const res = await fetch('/api/cart/item', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ itemId, quantity }),
        })

        const data = await res.json()
        if (data.success) {
          await refreshCart()
          return true
        }
        return false
      } catch (error) {
        console.error('Update quantity error:', error)
        return false
      }
    },
    [cart, isGuestMode, refreshCart, saveGuestCart]
  )

  // Clear cart
  const clearCart = useCallback(async (): Promise<boolean> => {
    try {
      if (isGuestMode) {
        localStorage.removeItem(GUEST_CART_KEY)
        setCart(null)
        return true
      }

      if (!cart?.id) return false

      const res = await fetch(`/api/cart?cartId=${cart.id}`, {
        method: 'DELETE',
      })

      const data = await res.json()
      if (data.success) {
        await refreshCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Clear cart error:', error)
      return false
    }
  }, [cart, isGuestMode, refreshCart])

  // Apply coupon
  const applyCoupon = useCallback(
    async (code: string): Promise<{ success: boolean; message: string }> => {
      try {
        const res = await fetch('/api/coupon', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            cartId: cart?.id,
            subtotal: cart?.subtotal,
          }),
        })

        const data = await res.json()
        if (data.success) {
          await refreshCart()
          return { success: true, message: data.message }
        }
        return { success: false, message: data.error || 'Kupon uygulanamadı.' }
      } catch (error) {
        console.error('Apply coupon error:', error)
        return { success: false, message: 'Bir hata oluştu.' }
      }
    },
    [cart, refreshCart]
  )

  // Remove coupon
  const removeCoupon = useCallback(async (): Promise<boolean> => {
    try {
      if (!cart?.id) return false

      const res = await fetch('/api/cart', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cartId: cart.id, action: 'removeCoupon' }),
      })

      const data = await res.json()
      if (data.success) {
        await refreshCart()
        return true
      }
      return false
    } catch (error) {
      console.error('Remove coupon error:', error)
      return false
    }
  }, [cart, refreshCart])

  const openDrawer = useCallback(() => setIsDrawerOpen(true), [])
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), [])

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoading,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
        refreshCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
