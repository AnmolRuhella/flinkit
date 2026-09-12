import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { confirmOrderRequest, fetchMyOrders, fetchMyShop } from '@/api/endpoints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'

export function SellerHomePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const shopQuery = useQuery({
    queryKey: ['shops', 'me'],
    queryFn: fetchMyShop,
    retry: false,
  })
  const ordersQuery = useQuery({
    queryKey: ['orders', 'seller'],
    queryFn: fetchMyOrders,
    refetchInterval: 5000,
  })

  const confirmMutation = useMutation({
    mutationFn: confirmOrderRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const pending = ordersQuery.data?.orders.filter((o) => o.status === 'PENDING') ?? []
  const others = ordersQuery.data?.orders.filter((o) => o.status !== 'PENDING') ?? []

  return (
    <div className="space-y-6">
      <Card className="space-y-2">
        <h2 className="text-lg font-semibold">
          {shopQuery.data?.shop.shopName ?? 'Seller dashboard'}
        </h2>
        <p className="text-sm text-[var(--color-muted)]">{user?.email}</p>
        {!shopQuery.data && (
          <p className="text-sm text-amber-700">
            Set up your shop so customers can browse your products.
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          <Link to="/seller/shop">
            <Button size="sm" variant="secondary">
              Shop profile
            </Button>
          </Link>
          <Link to="/seller/products">
            <Button size="sm" variant="secondary">
              Products
            </Button>
          </Link>
        </div>
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Pending — accept</h2>
          <Button variant="ghost" size="sm" onClick={() => ordersQuery.refetch()}>
            Refresh
          </Button>
        </div>
        {ordersQuery.isLoading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
        {ordersQuery.isError && (
          <p className="text-sm text-[var(--color-danger)]">{ordersQuery.error.message}</p>
        )}
        {pending.map((order) => (
          <Card key={order.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge>{order.status}</Badge>
              <span className="text-xs text-[var(--color-muted)]">{order.id}</span>
            </div>
            <p className="text-sm">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </p>
            <Button
              onClick={() => confirmMutation.mutate(order.id)}
              disabled={confirmMutation.isPending}
            >
              Accept order
            </Button>
          </Card>
        ))}
        {pending.length === 0 && !ordersQuery.isLoading && (
          <p className="text-sm text-[var(--color-muted)]">No pending orders.</p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Other orders</h2>
        {others.map((order) => (
          <Card key={order.id} className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">
                {order.items.map((i) => i.name).join(', ')}
              </p>
              <p className="text-xs text-[var(--color-muted)]">{order.id}</p>
            </div>
            <Badge>{order.status}</Badge>
          </Card>
        ))}
      </section>
    </div>
  )
}
