import { Link, Outlet } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/features/auth/AuthContext'

export function AppShell({ title }: { title: string }) {
  const { user, logout } = useAuth()

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center justify-between gap-3">
        <div>
          <Link to="/" className="text-xl font-semibold tracking-tight text-[var(--color-brand)]">
            Flinkit
          </Link>
          <p className="text-sm text-[var(--color-muted)]">
            {title}
            {user ? ` · ${user.name} (${user.role})` : null}
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={logout}>
          Logout
        </Button>
      </header>
      <Outlet />
    </div>
  )
}
