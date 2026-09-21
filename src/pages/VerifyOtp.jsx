import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { RefreshCw } from 'lucide-react';
import agriMitraLogo from '../assets/AgriMitra.png';
import toast from 'react-hot-toast';

export const VerifyOtp = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();

  const identifier = location.state?.identifier || '';
  const [fallbackOtp, setFallbackOtp] = useState(location.state?.fallbackOtp || '');

  useEffect(() => {
    if (!identifier) {
      toast.error('Please request an OTP first');
      navigate('/forgot-password');
      return;
    }

    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown, identifier, navigate]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({ mode: 'onTouched' });

  useEffect(() => {
    if (fallbackOtp) {
      setValue('otp', fallbackOtp);
    }
  }, [fallbackOtp, setValue]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await authService.verifyOtp(identifier, data.otp.trim());
      toast.success(res.message || 'OTP verified successfully!');
      navigate('/reset-password', {
        state: { identifier, otp: data.otp.trim() },
      });
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Invalid or expired OTP. Please try again.';
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    try {
      const res = await authService.forgotPassword(identifier);
      if (res.data?.otp) {
        setFallbackOtp(res.data.otp);
        setValue('otp', res.data.otp);
        toast.success(`New OTP code: ${res.data.otp}`, { duration: 6000 });
      } else {
        toast.success(res.message || 'New OTP sent!');
      }
      setCountdown(60);
    } catch (err) {
      toast.error('Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Enter OTP Code</h1>
          <p className="text-sm text-slate-600 mt-1">
            We sent a 6-digit verification code to <span className="text-emerald-900 font-semibold">{identifier}</span>
          </p>
          <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider mt-1.5">
            Sowing Prosperity • Growing Trust
          </p>
        </div>

        {/* Fallback OTP Banner (if SMTP is not configured) */}
        {fallbackOtp && (
          <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between">
            <div>
              <span className="font-semibold text-emerald-800">Verification OTP:</span>{' '}
              <code className="font-mono bg-white px-2 py-0.5 rounded border border-emerald-300 font-bold text-sm text-emerald-900">
                {fallbackOtp}
              </code>
              <p className="text-[10px] text-emerald-700 mt-0.5">Auto-filled (SMTP not active on server)</p>
            </div>
            <button
              type="button"
              onClick={() => setValue('otp', fallbackOtp)}
              className="text-[11px] font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-200/60 px-2.5 py-1 rounded-lg cursor-pointer transition"
            >
              Fill Code
            </button>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5 text-center">
              6-Digit One-Time Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="123456"
              className={`w-full text-center tracking-[0.75em] text-2xl font-mono py-3 bg-emerald-50/30 border rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 transition ${
                errors.otp
                  ? 'border-rose-500 focus:ring-rose-500/20'
                  : 'border-slate-300 focus:border-emerald-600 focus:ring-emerald-500/20'
              }`}
              {...register('otp', {
                required: 'Please enter the 6-digit OTP',
                pattern: {
                  value: /^[0-9]{6}$/,
                  message: 'OTP must be exactly 6 numeric digits',
                },
              })}
            />
            {errors.otp && (
              <p className="text-xs text-rose-500 mt-1.5 text-center">{errors.otp.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-md shadow-emerald-700/20 transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>Verify OTP</span>
            )}
          </button>
        </form>

        {/* Resend section */}
        <div className="mt-6 pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-1 hover:text-emerald-800 transition cursor-pointer font-medium"
          >
            <span>&larr; Change Identifier</span>
          </Link>

          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending}
            className={`inline-flex items-center gap-1 font-semibold transition ${
              countdown > 0 || isResending
                ? 'text-slate-400 cursor-not-allowed'
                : 'text-emerald-700 hover:text-emerald-800 cursor-pointer'
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
            <span>{countdown > 0 ? `Resend in ${countdown}s` : 'Resend OTP'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
