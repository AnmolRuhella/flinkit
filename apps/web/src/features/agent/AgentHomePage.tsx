import { useEffect, useRef, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  acceptOrderRequest,
  fetchAvailableOrders,
  fetchMyOrders,
  updateOrderStatusRequest,
} from '@/api/endpoints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function AgentHomePage() {
  const queryClient = useQueryClient()
  const [toast, setToast] = useState<string | null>(null)
  const prevCount = useRef<number | null>(null)

  const availableQuery = useQuery({
    queryKey: ['orders', 'available'],
    queryFn: fetchAvailableOrders,
    refetchInterval: 5000,
  })

  const mineQuery = useQuery({
    queryKey: ['orders', 'agent'],
    queryFn: fetchMyOrders,
    refetchInterval: 8000,
  })

  useEffect(() => {
    const count = availableQuery.data?.count
    if (count == null) return
    if (prevCount.current !== null && count > prevCount.current) {
      setToast(`New delivery job available (${count} open)`)
    }
    prevCount.current = count
  }, [availableQuery.data?.count])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(t)
  }, [toast])

  const acceptMutation = useMutation({
    mutationFn: acceptOrderRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
    },
  })

  const statusMutation = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string
      status: 'PICKED_UP' | 'DELIVERED'
    }) => updateOrderStatusRequest(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })

  const openCount = availableQuery.data?.count ?? 0

  return (
    <div className="space-y-6">
      {toast && (
        <div className="rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900">
          {toast}
        </div>
      )}

      <Card className="space-y-1">
        <h2 className="text-lg font-semibold">Delivery agent</h2>
        <p className="text-sm text-[var(--color-muted)]">
          Auto-refresh every 5s — when a shop accepts an order, it shows up here
          (MVP notification).
        </p>
        {openCount > 0 && (
          <p className="text-sm font-medium text-teal-800">
            {openCount} job{openCount === 1 ? '' : 's'} waiting for pickup
          </p>
        )}
      </Card>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Available jobs</h2>
          <Button variant="ghost" size="sm" onClick={() => availableQuery.refetch()}>
            Refresh
          </Button>
        </div>
        {availableQuery.isLoading && (
          <p className="text-sm text-[var(--color-muted)]">Loading…</p>
        )}
        {availableQuery.isError && (
          <p className="text-sm text-[var(--color-danger)]">{availableQuery.error.message}</p>
        )}
        {availableQuery.data?.orders.map((order) => (
          <Card key={order.id} className="space-y-3 border-teal-200">
            <div className="flex items-center justify-between">
              <Badge>New · {order.status}</Badge>
              <span className="text-xs text-[var(--color-muted)]">{order.id}</span>
            </div>
            <p className="text-sm">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Pickup: {order.pickupAddress.line1}, {order.pickupAddress.city}
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              Drop: {order.dropAddress.line1}, {order.dropAddress.city}
            </p>
            <Button
              onClick={() => acceptMutation.mutate(order.id)}
              disabled={acceptMutation.isPending}
            >
              Accept delivery
            </Button>
          </Card>
        ))}
        {availableQuery.data?.count === 0 && (
          <p className="text-sm text-[var(--color-muted)]">
            No open orders — waiting for shops to accept customer orders…
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">My deliveries</h2>
        {mineQuery.data?.orders.map((order) => (
          <Card key={order.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge>{order.status}</Badge>
              <span className="text-xs text-[var(--color-muted)]">{order.id}</span>
            </div>
            <p className="text-sm">
              {order.items.map((i) => `${i.name} × ${i.quantity}`).join(', ')}
            </p>
            <div className="flex flex-wrap gap-2">
              {order.status === 'ASSIGNED' && (
                <Button
                  size="sm"
                  onClick={() =>
                    statusMutation.mutate({ id: order.id, status: 'PICKED_UP' })
                  }
                >
                  Mark picked up
                </Button>
              )}
              {order.status === 'PICKED_UP' && (
                <Button
                  size="sm"
                  onClick={() =>
                    statusMutation.mutate({ id: order.id, status: 'DELIVERED' })
                  }
                >
                  Mark delivered
                </Button>
              )}
            </div>
          </Card>
        ))}
        {mineQuery.data?.count === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No assigned deliveries yet.</p>
        )}
      </section>
    </div>
  )
}
