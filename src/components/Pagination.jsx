import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({ page, totalPages, totalElements, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between px-1 py-3 text-xs text-slate-600">
      <span>
        Page <strong className="text-slate-900">{page + 1}</strong> of{' '}
        <strong className="text-slate-900">{totalPages}</strong>
        {typeof totalElements === 'number' && <span> &middot; {totalElements} total</span>}
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
