import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/features/auth/AuthContext'
import type { UserRole } from '@/lib/api'

export function RequireAuth({ roles }: { roles?: UserRole[] }) {
  const { isAuthenticated, user } = useAuth()
  const location = useLocation()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={homeForRole(user.role)} replace />
  }

  return <Outlet />
}

export function homeForRole(role: UserRole) {
  switch (role) {
    case 'CUSTOMER':
      return '/customer'
    case 'SELLER':
      return '/seller'
    case 'AGENT':
      return '/agent'
    case 'SUPERADMIN':
      return '/admin'
    default:
      return '/login'
  }
}
