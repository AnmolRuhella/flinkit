import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Product, Shop } from '@/lib/api'

export type CartItem = {
  productId: string
  name: string
  price: number
  quantity: number
}

type CartState = {
  shop: Shop | null
  items: CartItem[]
}

type CartContextValue = {
  shop: Shop | null
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (shop: Shop, product: Product) => void
  setQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

const CART_KEY = 'flinkit_cart'

function loadCart(): CartState {
  try {
    const raw = localStorage.getItem(CART_KEY)
    if (!raw) return { shop: null, items: [] }
    return JSON.parse(raw) as CartState
  } catch {
    return { shop: null, items: [] }
  }
}

function persist(state: CartState) {
  localStorage.setItem(CART_KEY, JSON.stringify(state))
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CartState>(() => loadCart())

  const update = useCallback((next: CartState) => {
    persist(next)
    setState(next)
  }, [])

  const addItem = useCallback(
    (shop: Shop, product: Product) => {
      setState((prev) => {
        let items = prev.items
        let nextShop = prev.shop

        if (prev.shop && prev.shop.id !== shop.id) {
          items = []
        }
        nextShop = shop

        const existing = items.find((i) => i.productId === product.id)
        const nextItems = existing
          ? items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: i.quantity + 1 }
                : i,
            )
          : [
              ...items,
              {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
              },
            ]

        const next = { shop: nextShop, items: nextItems }
        persist(next)
        return next
      })
    },
    [],
  )

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setState((prev) => {
      const items =
        quantity <= 0
          ? prev.items.filter((i) => i.productId !== productId)
          : prev.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i,
            )
      const next = {
        shop: items.length ? prev.shop : null,
        items,
      }
      persist(next)
      return next
    })
  }, [])

  const clearCart = useCallback(() => {
    update({ shop: null, items: [] })
  }, [update])

  const value = useMemo(() => {
    const total = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0)
    const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0)
    return {
      shop: state.shop,
      items: state.items,
      itemCount,
      total,
      addItem,
      setQuantity,
      clearCart,
    }
  }, [state, addItem, setQuantity, clearCart])

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
