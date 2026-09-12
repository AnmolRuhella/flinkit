import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { AdminHomePage } from '@/features/admin/AdminHomePage'
import { AgentHomePage } from '@/features/agent/AgentHomePage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { RequireAuth, homeForRole } from '@/features/auth/RequireAuth'
import { useAuth } from '@/features/auth/AuthContext'
import { CartPage } from '@/features/customer/CartPage'
import { CustomerHomePage } from '@/features/customer/CustomerHomePage'
import { CustomerOrdersPage } from '@/features/customer/CustomerOrdersPage'
import { ShopMenuPage } from '@/features/customer/ShopMenuPage'
import { SellerHomePage } from '@/features/seller/SellerHomePage'
import { SellerProductsPage } from '@/features/seller/SellerProductsPage'
import { SellerShopPage } from '@/features/seller/SellerShopPage'

function HomeRedirect() {
  const { isAuthenticated, user } = useAuth()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  return <Navigate to={homeForRole(user.role)} replace />
}

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/" element={<HomeRedirect />} />

      <Route element={<RequireAuth roles={['CUSTOMER']} />}>
        <Route element={<AppShell title="Customer" />}>
          <Route path="/customer" element={<CustomerHomePage />} />
          <Route path="/customer/shops/:shopId" element={<ShopMenuPage />} />
          <Route path="/customer/cart" element={<CartPage />} />
          <Route path="/customer/orders" element={<CustomerOrdersPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['SELLER']} />}>
        <Route element={<AppShell title="Seller" />}>
          <Route path="/seller" element={<SellerHomePage />} />
          <Route path="/seller/shop" element={<SellerShopPage />} />
          <Route path="/seller/products" element={<SellerProductsPage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['AGENT']} />}>
        <Route element={<AppShell title="Delivery agent" />}>
          <Route path="/agent" element={<AgentHomePage />} />
        </Route>
      </Route>

      <Route element={<RequireAuth roles={['SUPERADMIN']} />}>
        <Route element={<AppShell title="Admin" />}>
          <Route path="/admin" element={<AdminHomePage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
