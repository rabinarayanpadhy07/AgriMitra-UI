import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const ChangePassword = () => {
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const watchedNewPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (res.success) {
        toast.success(res.message || 'Password changed successfully!');
        reset();
        navigate('/dashboard');
      } else {
        toast.error(res.message || 'Failed to change password');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || 'Failed to change password. Please check your current password.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-200/50 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Change Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Update your account password securely
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.currentPassword
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
                {...register('currentPassword', {
                  required: 'Current password is required',
                })}
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-xs text-rose-500 mt-1">{errors.currentPassword.message}</p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.newPassword
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  validate: {
                    hasUpper: (v) => /[A-Z]/.test(v) || 'Must contain at least one uppercase letter',
                    hasLower: (v) => /[a-z]/.test(v) || 'Must contain at least one lowercase letter',
                    hasDigit: (v) => /\d/.test(v) || 'Must contain at least one numeric digit',
                    hasSpecial: (v) =>
                      /[@$!%*?&#^()_+=\-[\]{}|~`]/.test(v) ||
                      'Must contain at least one special character',
                  },
                })}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-rose-400 mt-1">{errors.newPassword.message}</p>
            )}

            <PasswordStrengthMeter password={watchedNewPassword} />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === watchedNewPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-rose-500 mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold shadow-md shadow-indigo-600/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Update Password</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
