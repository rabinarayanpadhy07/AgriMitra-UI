import React from 'react';

const VARIANTS = {
  ACTIVE: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  BLOCKED: 'bg-rose-50 text-rose-700 border-rose-200',
  REJECTED: 'bg-rose-50 text-rose-700 border-rose-200',
  SUSPENDED: 'bg-rose-50 text-rose-700 border-rose-200',
  PENDING: 'bg-amber-50 text-amber-700 border-amber-200',
  USER: 'bg-slate-100 text-slate-700 border-slate-200',
  SELLER: 'bg-sky-50 text-sky-700 border-sky-200',
  ADMIN: 'bg-violet-50 text-violet-700 border-violet-200',
};

export const StatusBadge = ({ status }) => {
  if (!status) return <span className="text-slate-400 text-xs">&mdash;</span>;

  const style = VARIANTS[status] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${style}`}
    >
      {status}
    </span>
  );
};
