import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
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
      const res = await adminCatalogService.listPayments({ status: statusFilter, page, size: 10 });
      setPayments(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (payment, status) => {
    try {
      await adminCatalogService.updatePaymentStatus(payment.id, status);
      toast.success('Payment status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update payment');
    }
  };

  return (
    <AdminLayout title="Payments" breadcrumb="Payments">
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} className={inputClass + ' sm:w-56 cursor-pointer'}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table headers={['Payment ID', 'Order', 'User', 'Amount', 'Method', 'Status', 'Date']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && payments.length === 0} emptyMessage="No payments found">
        {payments.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">#{p.id}</td>
            <td className="px-4 py-3 text-slate-600">#{p.orderId}</td>
            <td className="px-4 py-3 text-slate-600">{p.userName}</td>
            <td className="px-4 py-3 text-slate-600">₹{p.amount}</td>
            <td className="px-4 py-3"><StatusBadge status={p.method} /></td>
            <td className="px-4 py-3">
              <select value={p.status} onChange={(e) => changeStatus(p, e.target.value)} className="text-xs border border-slate-300 rounded-lg px-2 py-1 cursor-pointer">
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </td>
            <td className="px-4 py-3 text-slate-500">{new Date(p.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
    </AdminLayout>
  );
};
