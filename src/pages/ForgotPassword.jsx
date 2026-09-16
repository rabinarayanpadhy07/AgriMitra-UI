import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.forgotPassword(data.identifier.trim());
      toast.success(res.message || 'OTP has been generated and dispatched!');
      navigate('/verify-otp', { state: { identifier: data.identifier.trim() } });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate OTP. Please try again.';
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Recover Password</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your registered email or 10-digit mobile number to receive a verification OTP.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
              Email or Mobile Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="you@example.com or 9876543210"
              className={`w-full px-4 py-2.5 bg-white border rounded-xl text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 transition ${
                errors.identifier
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/20'
              }`}
              {...register('identifier', {
                required: 'Registered email or mobile number is required',
              })}
            />
            {errors.identifier && (
              <p className="text-xs text-rose-500 mt-1">{errors.identifier.message}</p>
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
              <span>Send Verification OTP</span>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 transition cursor-pointer font-medium"
          >
            <span>&larr; Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
