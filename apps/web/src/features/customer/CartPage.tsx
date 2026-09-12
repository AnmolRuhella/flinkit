import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { createOrderRequest } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCart } from '@/features/customer/CartContext'

const schema = z.object({
  line1: z.string().min(1),
  city: z.string().min(1),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function CartPage() {
  const navigate = useNavigate()
  const { shop, items, total, setQuantity, clearCart } = useCart()
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { line1: '', city: '', notes: '' },
  })

  const placeMutation = useMutation({
    mutationFn: createOrderRequest,
    onSuccess: () => {
      clearCart()
      navigate('/customer/orders')
    },
  })

  if (!shop || items.length === 0) {
    return (
      <Card className="space-y-3">
        <h2 className="text-lg font-semibold">Cart is empty</h2>
        <Link to="/customer">
          <Button>Browse shops</Button>
        </Link>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cart · {shop.shopName}</h2>
        <Button size="sm" variant="ghost" onClick={clearCart}>
          Clear
        </Button>
      </div>

      <section className="space-y-3">
        {items.map((item) => (
          <Card key={item.productId} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-[var(--color-muted)]">
                ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuantity(item.productId, item.quantity - 1)}
              >
                −
              </Button>
              <span className="w-6 text-center text-sm">{item.quantity}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setQuantity(item.productId, item.quantity + 1)}
              >
                +
              </Button>
            </div>
          </Card>
        ))}
        <p className="text-right font-semibold">Total ₹{total}</p>
      </section>

      <Card>
        <h3 className="font-medium">Delivery address</h3>
        <form
          className="mt-3 space-y-3"
          onSubmit={form.handleSubmit((values) =>
            placeMutation.mutate({
              sellerId: shop.userId,
              items: items.map((i) => ({
                productId: i.productId,
                quantity: i.quantity,
              })),
              dropAddress: { line1: values.line1, city: values.city },
              notes: values.notes,
            }),
          )}
        >
          <div>
            <Label>Address line</Label>
            <Input {...form.register('line1')} placeholder="Flat 4B, Baner" />
          </div>
          <div>
            <Label>City</Label>
            <Input {...form.register('city')} placeholder="Pune" />
          </div>
          <div>
            <Label>Notes</Label>
            <Input {...form.register('notes')} />
          </div>
          {placeMutation.isError && (
            <p className="text-sm text-[var(--color-danger)]">{placeMutation.error.message}</p>
          )}
          <Button className="w-full" type="submit" disabled={placeMutation.isPending}>
            {placeMutation.isPending ? 'Placing…' : 'Place order'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
