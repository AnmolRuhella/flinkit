import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { fetchMyShop, upsertMyShop } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  shopName: z.string().min(2),
  description: z.string().optional(),
  line1: z.string().min(1),
  city: z.string().min(1),
  isOpen: z.boolean(),
})

type FormValues = z.infer<typeof schema>

export function SellerShopPage() {
  const queryClient = useQueryClient()
  const shopQuery = useQuery({
    queryKey: ['shops', 'me'],
    queryFn: fetchMyShop,
    retry: false,
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: shopQuery.data
      ? {
          shopName: shopQuery.data.shop.shopName,
          description: shopQuery.data.shop.description ?? '',
          line1: shopQuery.data.shop.pickupAddress.line1,
          city: shopQuery.data.shop.pickupAddress.city,
          isOpen: shopQuery.data.shop.isOpen,
        }
      : undefined,
    defaultValues: {
      shopName: '',
      description: '',
      line1: '',
      city: '',
      isOpen: true,
    },
  })

  const saveMutation = useMutation({
    mutationFn: (values: FormValues) =>
      upsertMyShop({
        shopName: values.shopName,
        description: values.description,
        isOpen: values.isOpen,
        pickupAddress: { line1: values.line1, city: values.city },
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shops'] }),
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Shop profile</h2>
        <Link className="text-sm text-[var(--color-brand)]" to="/seller">
          ← Orders
        </Link>
      </div>
      <Card>
        {shopQuery.isError && (
          <p className="mb-3 text-sm text-[var(--color-muted)]">
            No shop yet — create one so customers can find you.
          </p>
        )}
        <form
          className="space-y-3"
          onSubmit={form.handleSubmit((values) => saveMutation.mutate(values))}
        >
          <div>
            <Label>Shop name</Label>
            <Input {...form.register('shopName')} placeholder="Fresh Mart" />
          </div>
          <div>
            <Label>Description</Label>
            <Input {...form.register('description')} placeholder="Groceries & snacks" />
          </div>
          <div>
            <Label>Pickup address</Label>
            <Input {...form.register('line1')} placeholder="Shop 12, MG Road" />
          </div>
          <div>
            <Label>City</Label>
            <Input {...form.register('city')} placeholder="Pune" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...form.register('isOpen')} />
            Shop is open
          </label>
          {saveMutation.isError && (
            <p className="text-sm text-[var(--color-danger)]">{saveMutation.error.message}</p>
          )}
          {saveMutation.isSuccess && (
            <p className="text-sm text-teal-700">Shop saved.</p>
          )}
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save shop'}
          </Button>
        </form>
      </Card>
      <Link className="text-sm font-medium text-[var(--color-brand)]" to="/seller/products">
        Manage products →
      </Link>
    </div>
  )
}
