import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { Register } from './pages/Register';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { VerifyOtp } from './pages/VerifyOtp';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { ChangePassword } from './pages/ChangePassword';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminSellers } from './pages/admin/AdminSellers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminPayments } from './pages/admin/AdminPayments';
import { AdminReviews } from './pages/admin/AdminReviews';
import { AdminCoupons } from './pages/admin/AdminCoupons';
import { AdminReturns } from './pages/admin/AdminReturns';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminCrops } from './pages/admin/AdminCrops';
import { AdminNotifications } from './pages/admin/AdminNotifications';
import { Shop } from './pages/Shop';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { Wishlist } from './pages/Wishlist';
import { Checkout } from './pages/Checkout';
import { MyOrders } from './pages/MyOrders';
import { OrderDetail } from './pages/OrderDetail';
import { Addresses } from './pages/Addresses';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/verify-otp" element={<VerifyOtp />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/dashboard" replace />}
              />
              <Route
                path="/admin/dashboard"
                element={
                  <AdminProtectedRoute>
                    <AdminDashboard />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <AdminProtectedRoute>
                    <AdminUsers />
                  </AdminProtectedRoute>
                }
              />
              <Route
                path="/admin/sellers"
                element={
                  <AdminProtectedRoute>
                    <AdminSellers />
                  </AdminProtectedRoute>
                }
              />
              <Route path="/admin/products" element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>} />
              <Route path="/admin/categories" element={<AdminProtectedRoute><AdminCategories /></AdminProtectedRoute>} />
              <Route path="/admin/inventory" element={<AdminProtectedRoute><AdminInventory /></AdminProtectedRoute>} />
              <Route path="/admin/orders" element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>} />
              <Route path="/admin/payments" element={<AdminProtectedRoute><AdminPayments /></AdminProtectedRoute>} />
              <Route path="/admin/reviews" element={<AdminProtectedRoute><AdminReviews /></AdminProtectedRoute>} />
              <Route path="/admin/coupons" element={<AdminProtectedRoute><AdminCoupons /></AdminProtectedRoute>} />
              <Route path="/admin/returns" element={<AdminProtectedRoute><AdminReturns /></AdminProtectedRoute>} />
              <Route path="/admin/banners" element={<AdminProtectedRoute><AdminBanners /></AdminProtectedRoute>} />
              <Route path="/admin/crops" element={<AdminProtectedRoute><AdminCrops /></AdminProtectedRoute>} />
              <Route path="/admin/crop-guides" element={<Navigate to="/admin/crops" replace />} />
              <Route path="/admin/notifications" element={<AdminProtectedRoute><AdminNotifications /></AdminProtectedRoute>} />

              {/* User Marketplace & Home Routes */}
              <Route path="/" element={<Shop />} />
              <Route path="/shop" element={<Navigate to="/" replace />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/shop/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><MyOrders /></ProtectedRoute>} />
              <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
              <Route path="/addresses" element={<ProtectedRoute><Addresses /></ProtectedRoute>} />

              {/* Wildcard redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#0f172a',
                border: '1px solid #e2e8f0',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
                borderRadius: '0.75rem',
                fontSize: '0.875rem',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
            }}
          />
        </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
