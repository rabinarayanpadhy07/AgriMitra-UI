import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  isSubmitting = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 relative">
        <button
          type="button"
          onClick={onCancel}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${
            danger ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          <AlertTriangle className="w-5 h-5" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1.5">{title}</h3>
        <p className="text-sm text-slate-600 mb-6">{message}</p>

        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-sm disabled:opacity-50 cursor-pointer transition ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
                : 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 shadow-emerald-700/20'
            }`}
          >
            {isSubmitting ? 'Please wait...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
