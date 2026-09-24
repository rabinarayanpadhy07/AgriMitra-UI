import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  Sprout,
  ShieldCheck,
  Leaf,
  ShoppingBag,
  PackageCheck,
  MapPin,
} from 'lucide-react';

export const Dashboard = () => {
  const { user, refreshProfile } = useAuth();

  useEffect(() => {
    refreshProfile();
  }, []);

  const formatDate = (isoString) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-800 via-emerald-700 to-green-700 text-white p-6 sm:p-10 shadow-xl shadow-emerald-950/10">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-400/30 text-emerald-200 text-xs font-semibold backdrop-blur-sm">
            <Sprout className="w-3.5 h-3.5 text-emerald-400" />
            <span>AgriMitra Partner Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Hello, {user?.fullName || 'Valued Member'}! 👋
          </h1>
          <p className="text-sm sm:text-base text-emerald-100 leading-relaxed">
            Welcome to your AgriMitra portal. <span className="font-semibold text-emerald-200">Sowing Prosperity. Growing Trust.</span>
          </p>
        </div>

        {/* Decorative background leaf */}
        <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute right-8 top-8 opacity-15 hidden lg:block">
          <Leaf className="w-48 h-48 text-white" />
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white border border-emerald-100 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AgriMitra Profile Details</h2>
              <p className="text-xs text-slate-500">Your verified account information</p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3 h-3" />
            <span>Active</span>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div>
            <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">
              Full Name
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              <User className="w-4 h-4 text-emerald-600" />
              <span>{user?.fullName}</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">
              Email Address
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-medium break-all">
              <Mail className="w-4 h-4 text-emerald-600" />
              <span>{user?.email}</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">
              Mobile Number
            </span>
            <div className="flex items-center gap-2 text-slate-900 font-medium">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>+91 {user?.mobileNumber}</span>
            </div>
          </div>

          <div>
            <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider block mb-1">
              Member Since
            </span>
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{formatDate(user?.createdAt)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs uppercase text-slate-500 font-semibold tracking-wider">
            AgriMitra Member ID
          </span>
          <span className="font-mono text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-bold">
            AGRIMITRA_#{user?.id}
          </span>
        </div>
      </div>

      {/* Admin shortcut */}
      {user?.role === 'ADMIN' && (
        <div className="bg-violet-50 border border-violet-200 rounded-2xl p-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center border border-violet-200">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">You have admin access</h2>
              <p className="text-xs text-slate-600">Manage users, sellers, and the platform.</p>
            </div>
          </div>
          <Link
            to="/admin/dashboard"
            className="text-xs font-semibold text-white bg-violet-600 hover:bg-violet-500 px-4 py-2 rounded-lg shadow-sm transition cursor-pointer"
          >
            Go to Admin Panel
          </Link>
        </div>
      )}

      {/* Quick Account Navigation */}
      <div className="space-y-3">
        <h3 className="text-xs uppercase text-slate-500 font-bold tracking-wider px-1">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            to="/"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Marketplace</h3>
              <p className="text-xs text-slate-500 mt-1">Browse seeds, fertilizers & tools</p>
            </div>
          </Link>

          <Link
            to="/orders"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">My Orders</h3>
              <p className="text-xs text-slate-500 mt-1">Track orders and delivery status</p>
            </div>
          </Link>

          <Link
            to="/addresses"
            className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition group flex flex-col justify-between cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition">Addresses</h3>
              <p className="text-xs text-slate-500 mt-1">Manage farm & delivery locations</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
