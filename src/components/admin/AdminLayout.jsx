import React, { useState } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  FolderTree,
  Boxes,
  ClipboardList,
  CreditCard,
  Star,
  Ticket,
  RotateCcw,
  Image,
  Sprout,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

const ACTIVE_LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/sellers', label: 'Sellers', icon: Store },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/orders', label: 'Orders', icon: ClipboardList },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/returns', label: 'Returns', icon: RotateCcw },
  { to: '/admin/banners', label: 'Banners', icon: Image },
  { to: '/admin/crops', label: 'Crops', icon: Sprout },
  { to: '/admin/notifications', label: 'Notifications', icon: Bell },
];

const SidebarLinks = ({ onNavigate }) => (
  <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
    <div className="space-y-1">
      {ACTIVE_LINKS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
              isActive
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/20'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <Icon className="w-4 h-4" />
          <span>{label}</span>
        </NavLink>
      ))}
    </div>
  </nav>
);

export const AdminLayout = ({ children, title, breadcrumb }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-slate-900 text-white shrink-0">
        <div className="h-16 flex items-center gap-2 px-5 border-b border-slate-800">
          <span className="text-sm font-bold tracking-wide">AgriMitra Admin</span>
        </div>
        <SidebarLinks />
        <div className="p-3 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-slate-800 hover:text-rose-200 cursor-pointer transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-slate-900 text-white flex flex-col">
            <div className="h-16 flex items-center justify-between gap-2 px-5 border-b border-slate-800">
              <span className="text-sm font-bold tracking-wide">AgriMitra Admin</span>
              <button onClick={() => setMobileOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            <SidebarLinks onNavigate={() => setMobileOpen(false)} />
            <div className="p-3 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-300 hover:bg-slate-800 cursor-pointer transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden text-slate-500 hover:text-slate-700 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <Link to="/admin/dashboard" className="hover:text-emerald-700 cursor-pointer">
                  Admin
                </Link>
                {breadcrumb && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-slate-700 font-medium">{breadcrumb}</span>
                  </>
                )}
              </div>
              <h1 className="text-base sm:text-lg font-bold text-slate-900 truncate">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard"
              className="hidden sm:inline text-xs font-medium text-slate-500 hover:text-emerald-700 cursor-pointer"
            >
              Back to site
            </Link>
            <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <span className="font-semibold">{user?.fullName || user?.email}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 min-w-0" key={location.pathname}>
          {children}
        </main>
      </div>
    </div>
  );
};
