import React from 'react';
import { X } from 'lucide-react';

export const Modal = ({ isOpen, title, onClose, children, maxWidth = 'max-w-lg' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start sm:items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm overflow-y-auto">
      <div className={`w-full ${maxWidth} bg-white rounded-2xl shadow-xl my-8`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export const FormField = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
  </div>
);

export const inputClass =
  'w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition';
