import { Card } from '@/components/ui/card'
import { useAuth } from '@/features/auth/AuthContext'

export function AdminHomePage() {
  const { user } = useAuth()

  return (
    <Card className="space-y-2">
      <h2 className="text-lg font-semibold">Superadmin</h2>
      <p className="text-sm text-[var(--color-muted)]">
        Logged in as {user?.email}. Use API / Postman for{' '}
        <code className="rounded bg-slate-100 px-1">GET /admin/users</code> for now.
        Full admin UI comes later.
      </p>
    </Card>
  )
}
