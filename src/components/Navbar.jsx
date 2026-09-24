import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { shopService } from '../services/shopService';
import {
  Search,
  X,
  LogOut,
  Key,
  ShieldCheck,
  ShoppingCart,
  Heart,
  ClipboardList,
  MapPin,
  ChevronDown,
  LayoutDashboard,
  Package,
} from 'lucide-react';
import { SearchAutocomplete } from './SearchAutocomplete';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

const DEFAULT_CATEGORIES = [
  { id: 1, name: 'Seeds & Hybrid Crops' },
  { id: 2, name: 'Fertilizers & Soil Nutrients' },
  { id: 3, name: 'Crop Protection & Bio-Pesticides' },
  { id: 4, name: 'Farm Equipment & Tools' },
];

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { cartCount } = useCart();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const urlSearch = searchParams.get('search') || '';
  const activeCategoryId = searchParams.get('category') || '';
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const isAdminRoute = location.pathname.startsWith('/admin');

  const handleSearchSubmitWithQuery = (searchTerm) => {
    const nextParams = new URLSearchParams(searchParams);
    const trimmed = (searchTerm || '').trim();
    if (trimmed) {
      nextParams.set('search', trimmed);
    } else {
      nextParams.delete('search');
    }
    nextParams.delete('page');
    navigate({ pathname: '/', search: nextParams.toString() });
  };

  const handleClearSearch = () => {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('search');
    nextParams.delete('page');
    navigate({ pathname: '/', search: nextParams.toString() });
  };

  // Fetch live categories from backend
  useEffect(() => {
    shopService
      .getCategories()
      .then((res) => {
        if (res.data && res.data.length > 0) {
          setCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategorySelect = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (!catId || activeCategoryId === String(catId)) {
      nextParams.delete('category');
    } else {
      nextParams.set('category', String(catId));
    }
    nextParams.delete('page');
    navigate({ pathname: '/', search: nextParams.toString() });
  };

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const displayName = user?.fullName || user?.email || 'Member';
  const firstName = user?.fullName ? user.fullName.split(' ')[0] : (user?.email?.split('@')[0] || 'User');
  const initial = (user?.fullName ? user.fullName.charAt(0) : (user?.email?.charAt(0) || 'U')).toUpperCase();

  return (
    <header className="bg-[#faf9f5]/95 backdrop-blur-md sticky top-0 z-50 border-b border-stone-200/80 shadow-2xs">
      {/* 1. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center shrink-0 group cursor-pointer">
          <img
            src={agriMitraLogo}
            alt="AgriMitra Logo"
            className="h-10 sm:h-11 w-auto object-contain group-hover:scale-105 transition-transform"
          />
        </Link>

        {/* Search Bar (Desktop) with Live Suggestions */}
        {!isAdminRoute && (
          <div className="hidden sm:block flex-1 max-w-xl mx-4 lg:mx-8">
            <SearchAutocomplete
              initialQuery={urlSearch}
              onSearchSubmit={(q) => handleSearchSubmitWithQuery(q)}
              onSelectProduct={(product) => navigate(`/shop/${product.id}`)}
              onClear={handleClearSearch}
            />
          </div>
        )}

        {/* Right Actions: Mobile Search Icon, Cart & User Profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile Search Icon (Only visible on small devices) */}
          {!isAdminRoute && (
            <button
              type="button"
              onClick={() => setMobileSearchOpen((prev) => !prev)}
              title="Search Products"
              className={`sm:hidden p-2 rounded-xl transition cursor-pointer ${
                mobileSearchOpen
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'text-stone-700 hover:text-emerald-700 hover:bg-[#eae7dd]'
              }`}
            >
              <Search className="w-5 h-5" />
            </button>
          )}

          {isAuthenticated ? (
            <>
              {/* Shopping Cart Icon with Live Count Badge */}
              <Link
                to="/cart"
                title="Shopping Cart"
                className="p-2 rounded-xl text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer relative"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-emerald-600 text-white font-extrabold text-[10px] min-w-5 h-5 px-1 rounded-full flex items-center justify-center border-2 border-[#faf9f5] shadow-xs animate-in zoom-in-75">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>

              {/* Single User Dropdown Menu */}
              <div className="relative ml-1" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer text-slate-700 font-medium text-xs sm:text-sm shadow-2xs"
                  aria-expanded={dropdownOpen}
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-600 to-green-600 text-white font-bold text-xs flex items-center justify-center uppercase shadow-xs">
                    {initial}
                  </div>
                  <span className="hidden sm:inline font-semibold text-slate-800 max-w-[120px] truncate">
                    {firstName}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-500 transition-transform ${
                      dropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User Info Header */}
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Signed in as
                      </p>
                      <p className="text-sm font-bold text-slate-900 truncate mt-0.5">
                        {displayName}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            user?.role === 'ADMIN'
                              ? 'bg-violet-100 text-violet-700 border border-violet-200'
                              : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {user?.role === 'ADMIN' ? 'ADMINISTRATOR' : 'MEMBER'}
                        </span>
                      </div>
                    </div>

                    {/* Admin Panel Link (if admin) */}
                    {user?.role === 'ADMIN' && (
                      <div className="px-2 pt-2 pb-1 border-b border-slate-100">
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 border border-violet-200 transition cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4 text-violet-600" />
                          <span>Admin Panel</span>
                        </Link>
                      </div>
                    )}

                    {/* Navigation Menu */}
                    <div className="px-2 py-1 space-y-0.5">
                      <Link
                        to="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                        <span>Dashboard</span>
                      </Link>

                      <Link
                        to="/orders"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <ClipboardList className="w-4 h-4 text-emerald-600" />
                        <span>My Orders</span>
                      </Link>

                      <Link
                        to="/wishlist"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <Heart className="w-4 h-4 text-emerald-600" />
                        <span>My Wishlist</span>
                      </Link>

                      <Link
                        to="/addresses"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>My Addresses</span>
                      </Link>

                      <Link
                        to="/change-password"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 transition cursor-pointer"
                      >
                        <Key className="w-4 h-4 text-emerald-600" />
                        <span>Change Password</span>
                      </Link>
                    </div>

                    {/* Logout Action */}
                    <div className="px-2 pt-1 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Log Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-700 hover:text-emerald-700 px-3.5 py-2 rounded-lg hover:bg-emerald-50 transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2 rounded-lg shadow-sm shadow-emerald-600/25 transition cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar Drawer (Only opens when search icon is clicked on small devices) */}
      {!isAdminRoute && mobileSearchOpen && (
        <div className="sm:hidden px-4 py-2 bg-[#faf9f5] border-t border-stone-200/80 shadow-xs relative animate-in slide-in-from-top-2 duration-150">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <SearchAutocomplete
                initialQuery={urlSearch}
                autoFocus={true}
                onSearchSubmit={(q) => {
                  setMobileSearchOpen(false);
                  handleSearchSubmitWithQuery(q);
                }}
                onSelectProduct={(product) => {
                  setMobileSearchOpen(false);
                  navigate(`/shop/${product.id}`);
                }}
                onClear={handleClearSearch}
                placeholder="Search seeds, fertilizers, equipment..."
              />
            </div>
            <button
              type="button"
              onClick={() => setMobileSearchOpen(false)}
              className="p-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-200/60 transition cursor-pointer shrink-0"
              title="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. Small Secondary Navbar (Category Strip Beside / Below) */}
      {!isAdminRoute && (
        <div className="bg-[#eeece3] border-t border-stone-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none text-xs">
              {/* All Items Button */}
              <button
                type="button"
                onClick={() => handleCategorySelect('')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                  !activeCategoryId
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-stone-700 hover:text-emerald-800 hover:bg-[#e3e1d6]'
                }`}
              >
                <Package className="w-3.5 h-3.5" />
                <span>All Products</span>
              </button>

              {/* Category Buttons */}
              {categories.map((cat) => {
                const isActive = activeCategoryId === String(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategorySelect(cat.id)}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-emerald-700 text-white shadow-2xs'
                        : 'text-stone-700 hover:text-emerald-800 hover:bg-[#e3e1d6]'
                    }`}
                  >
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
