import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { CheckCircle2, XCircle, Trash2, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['PENDING', 'APPROVED', 'REJECTED'];

export const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listReviews({ status: statusFilter, page, size: 10 });
      setReviews(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const approve = async (r) => {
    try { await adminCatalogService.approveReview(r.id); toast.success('Review approved'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };
  const reject = async (r) => {
    try { await adminCatalogService.rejectReview(r.id); toast.success('Review rejected'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try { await adminCatalogService.deleteReview(deleteTarget.id); toast.success('Review deleted'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete review'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AdminLayout title="Reviews" breadcrumb="Reviews">
      <div className="mb-4">
        <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} className={inputClass + ' sm:w-56 cursor-pointer'}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <Table headers={['Product', 'User', 'Rating', 'Comment', 'Status', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && reviews.length === 0} emptyMessage="No reviews found">
        {reviews.map((r) => (
          <tr key={r.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{r.productName}</td>
            <td className="px-4 py-3 text-slate-600">{r.userName}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-0.5 text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-amber-500' : 'text-slate-200'}`} />
                ))}
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600 max-w-xs truncate" title={r.comment}>{r.comment || '—'}</td>
            <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {r.status !== 'APPROVED' && (
                  <button onClick={() => approve(r)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Approve"><CheckCircle2 className="w-4 h-4" /></button>
                )}
                {r.status !== 'REJECTED' && (
                  <button onClick={() => reject(r)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Reject"><XCircle className="w-4 h-4" /></button>
                )}
                <button onClick={() => setDeleteTarget(r)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this review?" message="This will permanently delete the review."
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AdminLayout>
  );
};
