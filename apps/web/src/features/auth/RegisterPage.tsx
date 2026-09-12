import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { registerRequest } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useAuth } from '@/features/auth/AuthContext'
import { homeForRole } from '@/features/auth/RequireAuth'

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['CUSTOMER', 'SELLER', 'AGENT']),
})

type FormValues = z.infer<typeof schema>

export function RegisterPage() {
  const { isAuthenticated, user, loginSuccess } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'CUSTOMER' },
  })

  const mutation = useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      loginSuccess(data.accessToken, data.user)
      navigate(homeForRole(data.user.role), { replace: true })
    },
  })

  if (isAuthenticated && user) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-[var(--color-brand)]">Join Flinkit</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Register as customer, seller, or delivery agent
        </p>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
          <div>
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register('name')} />
            {errors.name && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.name.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" {...register('password')} />
            {errors.password && (
              <p className="mt-1 text-xs text-[var(--color-danger)]">{errors.password.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="role">I am a</Label>
            <Select id="role" {...register('role')}>
              <option value="CUSTOMER">Customer</option>
              <option value="SELLER">Seller (shop)</option>
              <option value="AGENT">Delivery agent</option>
            </Select>
          </div>
          {mutation.isError && (
            <p className="text-sm text-[var(--color-danger)]">{mutation.error.message}</p>
          )}
          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Creating…' : 'Create account'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          Already have an account?{' '}
          <Link className="font-medium text-[var(--color-brand)]" to="/login">
            Login
          </Link>
        </p>
      </Card>
    </div>
  )
}
