import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  code: '', type: 'PERCENTAGE', value: '', minOrderAmount: 0, maxDiscount: '',
  startDate: '', expiryDate: '', usageLimit: '', perUserLimit: '', active: true,
};

export const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listCoupons({ page, size: 10 });
      setCoupons(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load coupons');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      code: c.code, type: c.type, value: c.value, minOrderAmount: c.minOrderAmount, maxDiscount: c.maxDiscount ?? '',
      startDate: c.startDate, expiryDate: c.expiryDate, usageLimit: c.usageLimit ?? '', perUserLimit: c.perUserLimit ?? '',
      active: c.active,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        value: Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount === '' ? null : Number(form.maxDiscount),
        usageLimit: form.usageLimit === '' ? null : Number(form.usageLimit),
        perUserLimit: form.perUserLimit === '' ? null : Number(form.perUserLimit),
      };
      if (editingId) { await adminCatalogService.updateCoupon(editingId, payload); toast.success('Coupon updated'); }
      else { await adminCatalogService.createCoupon(payload); toast.success('Coupon created'); }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save coupon');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try { await adminCatalogService.deleteCoupon(deleteTarget.id); toast.success('Coupon deleted'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete coupon'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AdminLayout title="Coupons" breadcrumb="Coupons">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition">
          <Plus className="w-4 h-4" /> New Coupon
        </button>
      </div>

      <Table headers={['Code', 'Type', 'Value', 'Min Order', 'Usage', 'Expiry', 'Status', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && coupons.length === 0} emptyMessage="No coupons yet">
        {coupons.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-mono font-semibold text-slate-900">{c.code}</td>
            <td className="px-4 py-3 text-slate-600">{c.type}</td>
            <td className="px-4 py-3 text-slate-600">{c.type === 'PERCENTAGE' ? `${c.value}%` : `₹${c.value}`}</td>
            <td className="px-4 py-3 text-slate-600">₹{c.minOrderAmount}</td>
            <td className="px-4 py-3 text-slate-600">{c.usedCount}{c.usageLimit ? ` / ${c.usageLimit}` : ''}</td>
            <td className="px-4 py-3 text-slate-500">{c.expiryDate}</td>
            <td className="px-4 py-3"><StatusBadge status={c.active ? 'ACTIVE' : 'BLOCKED'} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(c)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => setDeleteTarget(c)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <Modal isOpen={modalOpen} title={editingId ? 'Edit Coupon' : 'New Coupon'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Code" required>
              <input className={inputClass + ' uppercase'} required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
            </FormField>
            <FormField label="Type" required>
              <select className={inputClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="PERCENTAGE">Percentage</option>
                <option value="FIXED">Fixed Amount</option>
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Value" required>
              <input type="number" step="0.01" className={inputClass} required value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} />
            </FormField>
            <FormField label="Max Discount">
              <input type="number" step="0.01" className={inputClass} value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Min Order Amount">
              <input type="number" step="0.01" className={inputClass} value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} />
            </FormField>
            <FormField label="Usage Limit">
              <input type="number" className={inputClass} value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Unlimited" />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Start Date" required>
              <input type="date" className={inputClass} required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </FormField>
            <FormField label="Expiry Date" required>
              <input type="date" className={inputClass} required value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Per-User Limit">
            <input type="number" className={inputClass} value={form.perUserLimit} onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} placeholder="Unlimited" />
          </FormField>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingId ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this coupon?" message={`This will permanently delete "${deleteTarget?.code}".`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AdminLayout>
  );
};
