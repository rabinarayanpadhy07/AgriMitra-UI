import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import toast from 'react-hot-toast';

const STATUSES = ['REQUESTED', 'APPROVED', 'REJECTED', 'PICKUP_PENDING', 'RECEIVED', 'REFUND_PENDING', 'REFUNDED', 'CLOSED'];

export const AdminReturns = () => {
  const [returns, setReturns] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listReturns({ status: statusFilter, page, size: 10 });
      setReturns(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load return requests');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (r, status) => {
    try { await adminCatalogService.updateReturnStatus(r.id, status); toast.success('Return status updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to update return'); }
  };

  return (
    <AdminLayout title="Returns & Refunds" breadcrumb="Returns">
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} className={inputClass + ' sm:w-56 cursor-pointer'}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
        </select>
      </div>

      <Table headers={['Order #', 'User', 'Reason', 'Status', 'Requested', 'Update']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && returns.length === 0} emptyMessage="No return requests found">
        {returns.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">#{r.orderId}</td>
            <td className="px-4 py-3 text-slate-600">{r.userName}</td>
            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={r.reason}>{r.reason || '—'}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3 text-slate-500">{new Date(r.requestedAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <select value={r.status} onChange={(e) => changeStatus(r, e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1 cursor-pointer">
                {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
              </select>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
    </AdminLayout>
  );
};
