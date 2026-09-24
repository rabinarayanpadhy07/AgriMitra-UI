import React from 'react';
import { Loader2, Inbox, AlertTriangle } from 'lucide-react';

export const Table = ({ headers, children, isLoading, isError, isEmpty, emptyMessage = 'No records found', errorMessage = 'Failed to load data' }) => {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            {headers.map((header) => (
              <th
                key={header}
                className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {isLoading ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">
                <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
                Loading...
              </td>
            </tr>
          ) : isError ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-rose-600">
                <AlertTriangle className="w-5 h-5 mx-auto mb-2" />
                {errorMessage}
              </td>
            </tr>
          ) : isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-4 py-10 text-center text-slate-500">
                <Inbox className="w-5 h-5 mx-auto mb-2 text-slate-400" />
                {emptyMessage}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
};
