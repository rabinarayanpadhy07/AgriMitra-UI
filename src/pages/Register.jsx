import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { PasswordStrengthMeter } from '../components/PasswordStrengthMeter';
import { Eye, EyeOff } from 'lucide-react';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

export const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
  });

  const watchedPassword = watch('password', '');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.register(data);
      if (res.success) {
        toast.success('Account created successfully! Please log in.');
        navigate('/login', { state: { email: data.email } });
      } else {
        toast.error(res.message || 'Registration failed');
      }
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Registration failed. Please check your information and try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-emerald-50/40 to-slate-50">
      <div className="w-full max-w-lg bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/5 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src={agriMitraLogo}
            alt="AgriMitra"
            className="h-16 w-auto mx-auto mb-2 drop-shadow-sm object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Create an Account</h1>
          <p className="text-sm text-slate-600 mt-1">Join <span className="font-semibold text-emerald-800">AgriMitra</span> today for secure agricultural access</p>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-1.5">
            Sowing Prosperity • Growing Trust
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                errors.fullName
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
              }`}
              {...register('fullName', {
                required: 'Full name is required',
                minLength: { value: 3, message: 'Minimum 3 characters required' },
                maxLength: { value: 100, message: 'Maximum 100 characters allowed' },
              })}
            />
            {errors.fullName && (
              <p className="text-xs text-rose-500 mt-1">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email Address */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                errors.email
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
              }`}
              {...register('email', {
                required: 'Email address is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Please enter a valid email address',
                },
              })}
            />
            {errors.email && (
              <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Mobile Number (10 Digits) <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                errors.mobileNumber
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
              }`}
              {...register('mobileNumber', {
                required: 'Mobile number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Mobile number must be exactly 10 numeric digits',
                },
              })}
            />
            {errors.mobileNumber && (
              <p className="text-xs text-rose-500 mt-1">{errors.mobileNumber.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.password
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
                {...register('password', {
                  required: 'Password is required',
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
            {errors.password && (
              <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
            )}

            <PasswordStrengthMeter password={watchedPassword} />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className={`w-full px-4 pr-11 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                  errors.confirmPassword
                    ? 'border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
                }`}
                {...register('confirmPassword', {
                  required: 'Please confirm your password',
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-md shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-4 cursor-pointer">
            Log in here
          </Link>
        </div>
      </div>
    </div>
  );
};
