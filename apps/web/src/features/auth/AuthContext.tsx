import { createContext, useContext, useMemo, useState, useCallback, type ReactNode } from 'react'
import {
  clearAuth,
  getAuth,
  saveAuth,
  type AuthUser,
} from '@/lib/api'

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  loginSuccess: (accessToken: string, user: AuthUser) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const initial = getAuth()
  const [token, setToken] = useState<string | null>(initial?.accessToken ?? null)
  const [user, setUser] = useState<AuthUser | null>(initial?.user ?? null)

  const loginSuccess = useCallback((accessToken: string, nextUser: AuthUser) => {
    saveAuth({ accessToken, user: nextUser })
    setToken(accessToken)
    setUser(nextUser)
  }, [])

  const logout = useCallback(() => {
    clearAuth()
    setToken(null)
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      loginSuccess,
      logout,
    }),
    [user, token, loginSuccess, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
