import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import agriMitraLogo from '../assets/AgriMitra.png';
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
      const fallbackOtp = res.data?.otp;
      if (fallbackOtp) {
        toast.success(`OTP code: ${fallbackOtp}`, { duration: 6000 });
      } else {
        toast.success(res.message || 'OTP has been generated and dispatched!');
      }
      navigate('/verify-otp', {
        state: {
          identifier: data.identifier.trim(),
          fallbackOtp,
        },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to generate OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Recover Password</h1>
          <p className="text-sm text-slate-600 mt-1">
            Enter your registered email or 10-digit mobile number to receive an <span className="font-semibold text-emerald-800">AgriMitra</span> OTP.
          </p>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-1.5">
            Sowing Prosperity • Growing Trust
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
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
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
            className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-md shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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
            className="inline-flex items-center gap-1 text-xs text-slate-600 hover:text-emerald-800 transition cursor-pointer font-medium"
          >
            <span>&larr; Back to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
