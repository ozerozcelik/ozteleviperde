'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'

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

function isCartItems(value: unknown): value is CartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as CartItem).id === 'string' &&
        typeof (item as CartItem).productId === 'string' &&
        typeof (item as CartItem).quantity === 'number' &&
        typeof (item as CartItem).price === 'number'
    )
  )
}

function normalizeCart(value: unknown): Cart | null {
  if (!value || typeof value !== 'object') {
    return null
  }

  const raw = value as Partial<Cart>
  if (typeof raw.id !== 'string' || !isCartItems(raw.items)) {
    return null
  }

  return {
    id: raw.id,
    userId: typeof raw.userId === 'string' ? raw.userId : null,
    sessionId: typeof raw.sessionId === 'string' ? raw.sessionId : null,
    items: raw.items,
    coupon: raw.coupon && typeof raw.coupon === 'object' ? raw.coupon : null,
    subtotal: typeof raw.subtotal === 'number' ? raw.subtotal : 0,
    discount: typeof raw.discount === 'number' ? raw.discount : 0,
    total: typeof raw.total === 'number' ? raw.total : 0,
  }
}

function isGuestCartItems(value: unknown): value is GuestCartItem[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === 'object' &&
        item !== null &&
        typeof (item as GuestCartItem).productId === 'string' &&
        typeof (item as GuestCartItem).quantity === 'number' &&
        typeof (item as GuestCartItem).price === 'number'
    )
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { status } = useSession()
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isGuestMode, setIsGuestMode] = useState(true)

  // Calculate item count
  const itemCount = Array.isArray(cart?.items)
    ? cart.items.reduce((sum, item) => sum + item.quantity, 0)
    : 0

  // Load cart from localStorage for guests
  const loadGuestCart = useCallback(() => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY)
      if (stored) {
        const parsed = JSON.parse(stored) as Partial<GuestCart>
        if (!isGuestCartItems(parsed?.items)) {
          localStorage.removeItem(GUEST_CART_KEY)
          setCart(null)
          return
        }
        const guestCart: GuestCart = { items: parsed.items, couponCode: parsed.couponCode }
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
      } else {
        setCart(null)
      }
    } catch (error) {
      console.error('Load guest cart error:', error)
      localStorage.removeItem(GUEST_CART_KEY)
      setCart(null)
    }
  }, [])

  const readGuestCart = useCallback((): GuestCart | null => {
    try {
      const stored = localStorage.getItem(GUEST_CART_KEY)
      if (!stored) return null

      const parsed = JSON.parse(stored) as Partial<GuestCart>
      if (!isGuestCartItems(parsed?.items)) {
        localStorage.removeItem(GUEST_CART_KEY)
        return null
      }

      return {
        items: parsed.items,
        couponCode: parsed.couponCode,
      }
    } catch (error) {
      console.error('Read guest cart error:', error)
      localStorage.removeItem(GUEST_CART_KEY)
      return null
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

  const mergeGuestCartToServer = useCallback(async () => {
    const guestCart = readGuestCart()
    if (!guestCart || guestCart.items.length === 0) return

    try {
      await fetch('/api/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })

      for (const item of guestCart.items) {
        const response = await fetch('/api/cart/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId: item.productId,
            quantity: item.quantity,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => null)
          console.warn(
            'Guest cart merge item failed:',
            item.productId,
            errorData?.error || response.statusText
          )
        }
      }

      localStorage.removeItem(GUEST_CART_KEY)
    } catch (error) {
      console.error('Merge guest cart error:', error)
    }
  }, [readGuestCart])

  // Refresh cart from API or localStorage
  const refreshCart = useCallback(async () => {
    setIsLoading(true)
    try {
      const isAuthenticated = status === 'authenticated'

      if (isAuthenticated) {
        await mergeGuestCartToServer()
        const res = await fetch('/api/cart')
        const data = await res.json()

        if (data.success) {
          setCart(normalizeCart(data.data))
        } else {
          setCart(null)
        }

        setIsGuestMode(false)
      } else {
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
  }, [loadGuestCart, mergeGuestCartToServer, status])

  // Load cart on mount
  useEffect(() => {
    if (status === 'loading') return
    refreshCart()
  }, [refreshCart, status])

  // Add item to cart
  const addItem = useCallback(
    async (productId: string, quantity = 1, notes?: string): Promise<boolean> => {
      try {
        const normalizedQuantity = Math.trunc(quantity)
        if (!Number.isInteger(normalizedQuantity) || normalizedQuantity < 1) {
          return false
        }

        // If guest mode, fetch product first and store locally
        if (isGuestMode) {
          // Fetch product details
          const productRes = await fetch(`/api/products?id=${productId}`)
          let product: Product | null = null

          if (productRes.ok) {
            const productData = await productRes.json()
            product = productData.data
          }

          if (!product) {
            console.error('Product not found')
            return false
          }

          // Update local cart
          const currentItems: GuestCartItem[] = (Array.isArray(cart?.items) ? cart.items : []).map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            product: item.product,
          })) || []

          const existingIndex = currentItems.findIndex((item) => item.productId === productId)

          if (existingIndex >= 0) {
            const nextQuantity = currentItems[existingIndex].quantity + normalizedQuantity
            if (product.stock > 0 && nextQuantity > product.stock) {
              return false
            }
            currentItems[existingIndex].quantity = nextQuantity
          } else {
            if (product.stock > 0 && normalizedQuantity > product.stock) {
              return false
            }
            currentItems.push({
              productId,
              quantity: normalizedQuantity,
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
          body: JSON.stringify({ productId, quantity: normalizedQuantity, notes }),
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
          const currentItems = Array.isArray(cart?.items) ? cart.items : []
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
          const currentItems = Array.isArray(cart?.items) ? cart.items : []
          const targetItem = currentItems.find((item) => item.id === itemId)
          if (!targetItem) return false
          if (targetItem.product.stock > 0 && quantity > targetItem.product.stock) {
            return false
          }
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
        if (!cart?.id) {
          return { success: false, message: 'Kupon sadece kayıtlı sepetlerde kullanılabilir.' }
        }

        if (isGuestMode) {
          return { success: false, message: 'Kupon kullanmak için giriş yapın.' }
        }

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
    [cart, isGuestMode, refreshCart]
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
