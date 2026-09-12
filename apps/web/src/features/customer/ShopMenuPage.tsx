import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { fetchShop, fetchShopProducts } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useCart } from '@/features/customer/CartContext'

export function ShopMenuPage() {
  const { shopId = '' } = useParams()
  const { addItem, itemCount, shop: cartShop } = useCart()

  const shopQuery = useQuery({
    queryKey: ['shops', shopId],
    queryFn: () => fetchShop(shopId),
    enabled: Boolean(shopId),
  })

  const productsQuery = useQuery({
    queryKey: ['shops', shopId, 'products'],
    queryFn: () => fetchShopProducts(shopId),
    enabled: Boolean(shopId),
  })

  const shop = shopQuery.data?.shop

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <Link className="text-sm text-[var(--color-brand)]" to="/customer">
          ← Shops
        </Link>
        <Link to="/customer/cart">
          <Button size="sm">Cart ({itemCount})</Button>
        </Link>
      </div>

      {shopQuery.isLoading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
      {shop && (
        <Card>
          <h2 className="text-xl font-semibold">{shop.shopName}</h2>
          <p className="mt-1 text-sm text-[var(--color-muted)]">
            {shop.description || `${shop.pickupAddress.line1}, ${shop.pickupAddress.city}`}
          </p>
          {cartShop && cartShop.id !== shop.id && (
            <p className="mt-2 text-sm text-amber-700">
              Adding from this shop will clear your cart from {cartShop.shopName}.
            </p>
          )}
        </Card>
      )}

      <section className="space-y-3">
        <h3 className="font-medium">Menu</h3>
        {productsQuery.data?.products.map((product) => (
          <Card key={product.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                ₹{product.price}
                {product.description ? ` · ${product.description}` : ''}
              </p>
            </div>
            <Button
              size="sm"
              disabled={!shop}
              onClick={() => shop && addItem(shop, product)}
            >
              Add
            </Button>
          </Card>
        ))}
        {productsQuery.data?.count === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No products in this shop yet.</p>
        )}
      </section>
    </div>
  )
}
