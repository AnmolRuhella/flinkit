import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { fetchMyOrders, updateOrderStatusRequest } from '@/api/endpoints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function CustomerOrdersPage() {
  const queryClient = useQueryClient()
  const ordersQuery = useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: fetchMyOrders,
  })

  const cancelMutation = useMutation({
    mutationFn: (id: string) => updateOrderStatusRequest(id, 'CANCELLED'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My orders</h2>
        <Link to="/customer">
          <Button size="sm" variant="secondary">
            Browse shops
          </Button>
        </Link>
      </div>
      {ordersQuery.isLoading && <p className="text-sm text-[var(--color-muted)]">Loading…</p>}
      {ordersQuery.data?.orders.map((order) => (
        <Card key={order.id} className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <Badge>{order.status}</Badge>
            <span className="text-xs text-[var(--color-muted)]">{order.id}</span>
          </div>
          <p className="text-sm">
            {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
          </p>
          {order.totalAmount != null && (
            <p className="text-sm font-medium">₹{order.totalAmount}</p>
          )}
          {(order.status === 'PENDING' || order.status === 'CONFIRMED') && (
            <Button
              size="sm"
              variant="danger"
              disabled={cancelMutation.isPending}
              onClick={() => cancelMutation.mutate(order.id)}
            >
              Cancel
            </Button>
          )}
        </Card>
      ))}
      {ordersQuery.data?.count === 0 && (
        <p className="text-sm text-[var(--color-muted)]">No orders yet.</p>
      )}
    </div>
  )
}
