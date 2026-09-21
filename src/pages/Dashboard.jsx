import React, { useEffect } from 'react';
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
    </div>
  );
};
