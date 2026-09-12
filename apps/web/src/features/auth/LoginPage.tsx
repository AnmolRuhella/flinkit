import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { loginRequest } from '@/api/endpoints'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/AuthContext'
import { homeForRole } from '@/features/auth/RequireAuth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

type FormValues = z.infer<typeof schema>

export function LoginPage() {
  const { isAuthenticated, user, loginSuccess } = useAuth()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const fillDemo = (email: string) => {
    setValue('email', email)
    setValue('password', 'Demo@12345')
  }

  const mutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      loginSuccess(data.accessToken, data.user)
      navigate(homeForRole(data.user.role), { replace: true })
    },
  })

  if (isAuthenticated && user) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-4">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-semibold text-[var(--color-brand)]">Flinkit</h1>
        <p className="mt-1 text-sm text-[var(--color-muted)]">Sign in to continue</p>
      </div>
      <Card>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((values) => mutation.mutate(values))}
        >
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
          {mutation.isError && (
            <p className="text-sm text-[var(--color-danger)]">{mutation.error.message}</p>
          )}
          <Button className="w-full" type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in…' : 'Login'}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-[var(--color-muted)]">
          New here?{' '}
          <Link className="font-medium text-[var(--color-brand)]" to="/register">
            Register
          </Link>
        </p>
      </Card>

      <Card className="mt-4 space-y-2">
        <p className="text-sm font-medium">Demo accounts (after `npm run seed:demo`)</p>
        <p className="text-xs text-[var(--color-muted)]">Password: Demo@12345 — click to fill</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={() => fillDemo('customer@flinkit.demo')}>
            Customer
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => fillDemo('seller@flinkit.demo')}>
            Seller
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => fillDemo('agent@flinkit.demo')}>
            Agent
          </Button>
        </div>
      </Card>
    </div>
  )
}
