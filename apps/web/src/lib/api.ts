export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

export type UserRole = 'CUSTOMER' | 'SELLER' | 'AGENT' | 'SUPERADMIN'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
  phone?: string
  createdAt?: string
}

export type Address = {
  line1: string
  city: string
  lat?: number
  lng?: number
}

export type Shop = {
  id: string
  userId: string
  shopName: string
  description?: string
  pickupAddress: Address
  isOpen: boolean
  createdAt?: string
}

export type Product = {
  id: string
  sellerId: string
  name: string
  description?: string
  price: number
  isAvailable: boolean
  shopId?: string
  shopName?: string
  createdAt?: string
}

export type Order = {
  id: string
  customerId: string
  sellerId: string
  agentId: string | null
  items: { productId?: string; name: string; quantity: number; price?: number }[]
  notes?: string
  pickupAddress: Address
  dropAddress: Address
  status: string
  totalAmount?: number
  createdAt?: string
}

type AuthState = {
  accessToken: string
  user: AuthUser
}

const AUTH_KEY = 'flinkit_auth'

export function saveAuth(state: AuthState) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(state))
}

export function clearAuth() {
  localStorage.removeItem(AUTH_KEY)
}

export function getAuth(): AuthState | null {
  const raw = localStorage.getItem(AUTH_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw) as AuthState
  } catch {
    return null
  }
}

export function getToken() {
  return getAuth()?.accessToken ?? null
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers)
  if (options.body !== undefined) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message =
      typeof data === 'object' && data && 'message' in data
        ? String((data as { message: string }).message)
        : `Request failed (${res.status})`
    throw new Error(message)
  }

  return data as T
}
