import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import {
  createMyProduct,
  fetchMyProducts,
  updateMyProduct,
} from '@/api/endpoints'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  price: z.number().min(0),
})

type FormValues = z.infer<typeof schema>

export function SellerProductsPage() {
  const queryClient = useQueryClient()
  const productsQuery = useQuery({
    queryKey: ['products', 'mine'],
    queryFn: fetchMyProducts,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', price: 0 },
  })

  const createMutation = useMutation({
    mutationFn: createMyProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      form.reset({ name: '', description: '', price: 0 })
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, isAvailable }: { id: string; isAvailable: boolean }) =>
      updateMyProduct(id, { isAvailable }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Products</h2>
        <Link className="text-sm text-[var(--color-brand)]" to="/seller/shop">
          Shop profile
        </Link>
      </div>

      <Card>
        <h3 className="font-medium">Add product</h3>
        <form
          className="mt-3 space-y-3"
          onSubmit={form.handleSubmit((values) => createMutation.mutate(values))}
        >
          <div>
            <Label>Name</Label>
            <Input {...form.register('name')} placeholder="Milk 1L" />
          </div>
          <div>
            <Label>Description</Label>
            <Input {...form.register('description')} />
          </div>
          <div>
            <Label>Price</Label>
            <Input
              type="number"
              step="0.01"
              {...form.register('price', { valueAsNumber: true })}
            />
          </div>
          {createMutation.isError && (
            <p className="text-sm text-[var(--color-danger)]">{createMutation.error.message}</p>
          )}
          <Button type="submit" disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Adding…' : 'Add product'}
          </Button>
        </form>
      </Card>

      <section className="space-y-3">
        {productsQuery.data?.products.map((product) => (
          <Card key={product.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-sm text-[var(--color-muted)]">₹{product.price}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={product.isAvailable ? undefined : 'bg-slate-100 text-slate-600'}>
                {product.isAvailable ? 'Available' : 'Hidden'}
              </Badge>
              <Button
                size="sm"
                variant="secondary"
                onClick={() =>
                  toggleMutation.mutate({
                    id: product.id,
                    isAvailable: !product.isAvailable,
                  })
                }
              >
                {product.isAvailable ? 'Hide' : 'Show'}
              </Button>
            </div>
          </Card>
        ))}
        {productsQuery.data?.count === 0 && (
          <p className="text-sm text-[var(--color-muted)]">No products yet.</p>
        )}
      </section>
    </div>
  )
}
