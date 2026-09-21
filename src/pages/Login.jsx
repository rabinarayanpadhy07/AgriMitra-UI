import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Eye, EyeOff } from 'lucide-react';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

export const Login = () => {
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' | 'mobile'
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const defaultEmail = location.state?.email || '';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      identifier: defaultEmail,
      password: '',
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.login({
        identifier: data.identifier.trim(),
        password: data.password,
      });

      if (res.success && res.data) {
        login(res.data.token, res.data.user);
        toast.success(`Welcome back, ${res.data.user.fullName}!`);
        const origin = location.state?.from?.pathname || '/dashboard';
        navigate(origin, { replace: true });
      } else {
        toast.error(res.message || 'Invalid credentials');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid credentials. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMethod = (method) => {
    setLoginMethod(method);
    setValue('identifier', '');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-emerald-50/40 to-slate-50">
      <div className="w-full max-w-md bg-white border border-emerald-100 rounded-2xl shadow-xl shadow-emerald-900/5 p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <img
            src={agriMitraLogo}
            alt="AgriMitra"
            className="h-16 w-auto mx-auto mb-2 drop-shadow-sm object-contain"
          />
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-slate-600 mt-1">Sign in to access your <span className="font-semibold text-emerald-800">AgriMitra</span> account</p>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-1.5">
            Sowing Prosperity • Growing Trust
          </p>
        </div>

        {/* Tab switch: Email vs Mobile Number */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-emerald-50/80 rounded-xl border border-emerald-200 mb-6">
          <button
            type="button"
            onClick={() => switchMethod('email')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              loginMethod === 'email'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            Email Login
          </button>
          <button
            type="button"
            onClick={() => switchMethod('mobile')}
            className={`py-2 text-xs font-semibold rounded-lg transition cursor-pointer ${
              loginMethod === 'mobile'
                ? 'bg-white text-emerald-800 shadow-xs border border-emerald-200/50'
                : 'text-slate-600 hover:text-emerald-900'
            }`}
          >
            Mobile Login
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Identifier field */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              {loginMethod === 'email' ? 'Registered Email Address' : 'Registered Mobile Number'}
              <span className="text-rose-500"> *</span>
            </label>
            <input
              type={loginMethod === 'email' ? 'email' : 'tel'}
              placeholder={loginMethod === 'email' ? 'you@example.com' : '9876543210'}
              maxLength={loginMethod === 'mobile' ? 10 : 100}
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                errors.identifier
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
              }`}
              {...register('identifier', {
                required:
                  loginMethod === 'email'
                    ? 'Email address is required'
                    : 'Mobile number is required',
                pattern:
                  loginMethod === 'email'
                    ? {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Please enter a valid email address',
                      }
                    : {
                        value: /^[0-9]{10}$/,
                        message: 'Mobile number must be exactly 10 digits',
                      },
              })}
            />
            {errors.identifier && (
              <p className="text-xs text-rose-500 mt-1">{errors.identifier.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-medium transition cursor-pointer"
              >
                Forgot password?
              </Link>
            </div>
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
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-md shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-semibold underline underline-offset-4 cursor-pointer">
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
};
