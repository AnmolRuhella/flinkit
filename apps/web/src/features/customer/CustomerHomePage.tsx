import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchShops, searchProducts } from '@/api/endpoints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCart } from '@/features/customer/CartContext'

export function CustomerHomePage() {
  const [q, setQ] = useState('')
  const [submitted, setSubmitted] = useState('')
  const { itemCount } = useCart()

  const shopsQuery = useQuery({
    queryKey: ['shops', submitted],
    queryFn: () => fetchShops(submitted || undefined),
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'search', submitted],
    queryFn: () => searchProducts(submitted),
    enabled: submitted.trim().length > 0,
  })

  const shops = shopsQuery.data?.shops ?? []
  const productHits = useMemo(
    () => productsQuery.data?.products ?? [],
    [productsQuery.data],
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Find shops & products</h2>
        <div className="flex gap-2">
          <Link to="/customer/orders">
            <Button size="sm" variant="secondary">
              My orders
            </Button>
          </Link>
          <Link to="/customer/cart">
            <Button size="sm">Cart ({itemCount})</Button>
          </Link>
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault()
          setSubmitted(q.trim())
        }}
      >
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search shops or products…"
        />
        <Button type="submit">Search</Button>
      </form>

      {submitted && (
        <section className="space-y-3">
          <h3 className="font-medium">Products matching “{submitted}”</h3>
          {productsQuery.isLoading && (
            <p className="text-sm text-[var(--color-muted)]">Searching…</p>
          )}
          {productHits.map((product) => (
            <Link key={product.id} to={`/customer/shops/${product.shopId}`}>
              <Card className="mb-2 transition hover:border-teal-300">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-[var(--color-muted)]">
                      {product.shopName} · ₹{product.price}
                    </p>
                  </div>
                  <Badge>View shop</Badge>
                </div>
              </Card>
            </Link>
          ))}
          {!productsQuery.isLoading && productHits.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">No products found.</p>
          )}
        </section>
      )}

      <section className="space-y-3">
        <h3 className="font-medium">{submitted ? 'Matching shops' : 'Open shops'}</h3>
        {shopsQuery.isLoading && (
          <p className="text-sm text-[var(--color-muted)]">Loading shops…</p>
        )}
        {shopsQuery.isError && (
          <p className="text-sm text-[var(--color-danger)]">{shopsQuery.error.message}</p>
        )}
        {shops.map((shop) => (
          <Link key={shop.id} to={`/customer/shops/${shop.id}`}>
            <Card className="mb-2 transition hover:border-teal-300">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{shop.shopName}</p>
                  <p className="text-sm text-[var(--color-muted)]">
                    {shop.description || `${shop.pickupAddress.line1}, ${shop.pickupAddress.city}`}
                  </p>
                </div>
                <Badge>Open</Badge>
              </div>
            </Card>
          </Link>
        ))}
        {!shopsQuery.isLoading && shops.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No shops yet. Ask a seller to set up.</p>
        )}
      </section>
    </div>
  )
}
