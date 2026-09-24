import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { Modal, inputClass } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Eye, Ban } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUSES = ['PLACED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED',
  'CANCELLED', 'RETURN_REQUESTED', 'RETURNED', 'REFUNDED'];

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [detail, setDetail] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listOrders({ status: statusFilter, page, size: 10 });
      setOrders(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, page]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (order, status) => {
    try {
      await adminCatalogService.updateOrderStatus(order.id, status);
      toast.success('Order status updated');
      load();
      if (detail?.id === order.id) setDetail({ ...detail, status });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const confirmCancel = async () => {
    if (!cancelTarget) return;
    setIsSubmitting(true);
    try {
      await adminCatalogService.cancelOrder(cancelTarget.id);
      toast.success('Order cancelled');
      setCancelTarget(null);
      setDetail(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Orders" breadcrumb="Orders">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <select value={statusFilter} onChange={(e) => { setPage(0); setStatusFilter(e.target.value); }} className={inputClass + ' sm:w-56 cursor-pointer'}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
        </select>
      </div>

      <Table headers={['Order #', 'Customer', 'Total', 'Status', 'Placed', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && orders.length === 0} emptyMessage="No orders found">
        {orders.map((o) => (
          <tr key={o.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">#{o.id}</td>
            <td className="px-4 py-3 text-slate-600">{o.userName}</td>
            <td className="px-4 py-3 text-slate-600">₹{o.totalAmount}</td>
            <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
            <td className="px-4 py-3 text-slate-500">{new Date(o.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setDetail(o)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="View"><Eye className="w-4 h-4" /></button>
                {o.status !== 'CANCELLED' && o.status !== 'DELIVERED' && o.status !== 'REFUNDED' && (
                  <button onClick={() => setCancelTarget(o)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Cancel"><Ban className="w-4 h-4" /></button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <Modal isOpen={!!detail} title={`Order #${detail?.id}`} onClose={() => setDetail(null)} maxWidth="max-w-xl">
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{detail.userName}</p>
                <p className="text-xs text-slate-500">{detail.userEmail}</p>
              </div>
              <select value={detail.status} onChange={(e) => changeStatus(detail, e.target.value)} className={inputClass + ' w-48 cursor-pointer'}>
                {STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}
              </select>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <p className="font-semibold text-slate-800 mb-1">Shipping Address</p>
              <p>{detail.shippingFullName} · {detail.shippingPhone}</p>
              <p>{detail.shippingLine1}{detail.shippingLine2 ? `, ${detail.shippingLine2}` : ''}</p>
              <p>{detail.shippingCity}, {detail.shippingState} {detail.shippingPincode}, {detail.shippingCountry}</p>
            </div>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
              {detail.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-xs text-slate-500">Qty {item.quantity} × ₹{item.unitPrice}</p>
                  </div>
                  <p className="font-semibold text-slate-900">₹{item.lineTotal}</p>
                </div>
              ))}
            </div>

            <div className="text-xs space-y-1 text-slate-600">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{detail.subtotal}</span></div>
              <div className="flex justify-between"><span>Discount {detail.couponCode ? `(${detail.couponCode})` : ''}</span><span>-₹{detail.discountAmount}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>₹{detail.shippingFee}</span></div>
              <div className="flex justify-between font-bold text-slate-900 text-sm pt-1 border-t border-slate-200"><span>Total</span><span>₹{detail.totalAmount}</span></div>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={!!cancelTarget} title="Cancel this order?"
        message={`Order #${cancelTarget?.id} will be cancelled and its items restocked.`}
        confirmText="Cancel Order" danger isSubmitting={isSubmitting} onConfirm={confirmCancel} onCancel={() => setCancelTarget(null)} />
    </AdminLayout>
  );
};
