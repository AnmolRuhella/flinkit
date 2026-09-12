import {
  apiFetch,
  type AuthUser,
  type Order,
  type Product,
  type Shop,
} from '@/lib/api'

export async function loginRequest(body: { email: string; password: string }) {
  return apiFetch<{ user: AuthUser; accessToken: string }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function registerRequest(body: {
  name: string
  email: string
  password: string
  role: 'CUSTOMER' | 'SELLER' | 'AGENT'
  phone?: string
}) {
  return apiFetch<{ user: AuthUser; accessToken: string }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function fetchMyOrders() {
  return apiFetch<{ orders: Order[]; count: number }>('/orders')
}

export async function fetchAvailableOrders() {
  return apiFetch<{ orders: Order[]; count: number }>('/orders/available')
}

export async function createOrderRequest(body: unknown) {
  return apiFetch<{ order: Order }>('/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function confirmOrderRequest(id: string) {
  return apiFetch<{ order: Order }>(`/orders/${id}/confirm`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function acceptOrderRequest(id: string) {
  return apiFetch<{ order: Order }>(`/orders/${id}/accept`, {
    method: 'POST',
    body: JSON.stringify({}),
  })
}

export async function updateOrderStatusRequest(
  id: string,
  status: 'PICKED_UP' | 'DELIVERED' | 'CANCELLED' | 'CONFIRMED',
) {
  return apiFetch<{ order: Order }>(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function fetchShops(q?: string) {
  const query = q?.trim() ? `?q=${encodeURIComponent(q.trim())}` : ''
  return apiFetch<{ shops: Shop[]; count: number }>(`/shops${query}`)
}

export async function fetchShop(id: string) {
  return apiFetch<{ shop: Shop }>(`/shops/${id}`)
}

export async function fetchShopProducts(shopId: string) {
  return apiFetch<{ products: Product[]; count: number }>(
    `/shops/${shopId}/products`,
  )
}

export async function searchProducts(q: string) {
  return apiFetch<{ products: Product[]; count: number }>(
    `/products/search?q=${encodeURIComponent(q)}`,
  )
}

export async function fetchMyShop() {
  return apiFetch<{ shop: Shop }>('/shops/me')
}

export async function upsertMyShop(body: unknown) {
  return apiFetch<{ shop: Shop }>('/shops/me', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function fetchMyProducts() {
  return apiFetch<{ products: Product[]; count: number }>('/shops/me/products')
}

export async function createMyProduct(body: unknown) {
  return apiFetch<{ product: Product }>('/shops/me/products', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

export async function updateMyProduct(id: string, body: unknown) {
  return apiFetch<{ product: Product }>(`/shops/me/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}
