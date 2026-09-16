import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

export const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const identifier = location.state?.identifier || '';
  const otp = location.state?.otp || '';

  useEffect(() => {
    if (!identifier || !otp) {
      toast.error('Session expired. Please request a new OTP');
      navigate('/forgot-password');
    }
  }, [identifier, otp, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const watchedPassword = watch('newPassword', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.resetPassword({
        identifier,
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      });

      if (res.success) {
        toast.success(res.message || 'Password reset successfully! Please log in.');
        navigate('/login', { state: { email: identifier } });
      } else {
        toast.error(res.message || 'Failed to reset password');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to reset password. Please try again.';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Set New Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Create a secure new password for your ShopEasy account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
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
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.newPassword && (
              <p className="text-xs text-rose-500 mt-1">{errors.newPassword.message}</p>
            )}

            <PasswordStrengthMeter password={watchedPassword} />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your new password',
                  validate: (val) => val === watchedPassword || 'Passwords do not match',
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
              <span>Reset Password & Invalidate Sessions</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Remember your password?{' '}
          <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-semibold underline underline-offset-4 cursor-pointer">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
