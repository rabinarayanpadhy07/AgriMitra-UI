import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, LogOut, Key, User, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-slate-900 group cursor-pointer">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <ShoppingBag className="w-5 h-5 text-white" />
          </div>
          <span>
            Shop<span className="text-indigo-600">Easy</span>
          </span>
        </Link>

        {/* Navigation / Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {isAuthenticated ? (
            <>
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Logged in as <strong className="text-slate-900">{user?.fullName || user?.email}</strong></span>
              </div>

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <User className="w-4 h-4" />
                <span>Dashboard</span>
              </Link>

              <Link
                to="/change-password"
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <Key className="w-4 h-4" />
                <span>Change Password</span>
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-rose-600 hover:text-rose-700 px-3 py-2 rounded-lg hover:bg-rose-50 border border-rose-200 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs sm:text-sm font-medium text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="text-xs sm:text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-lg shadow-sm shadow-indigo-600/20 transition cursor-pointer"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
