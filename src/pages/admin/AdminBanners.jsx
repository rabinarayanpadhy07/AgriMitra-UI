import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { title: '', imageUrl: '', ctaText: '', ctaLink: '', displayOrder: 0, active: true, startDate: '', endDate: '' };

export const AdminBanners = () => {
  const [banners, setBanners] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listBanners();
      setBanners(res.data || []);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load banners');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (b) => {
    setEditingId(b.id);
    setForm({
      title: b.title, imageUrl: b.imageUrl, ctaText: b.ctaText || '', ctaLink: b.ctaLink || '',
      displayOrder: b.displayOrder, active: b.active, startDate: b.startDate || '', endDate: b.endDate || '',
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, displayOrder: Number(form.displayOrder) || 0 };
      if (editingId) { await adminCatalogService.updateBanner(editingId, payload); toast.success('Banner updated'); }
      else { await adminCatalogService.createBanner(payload); toast.success('Banner created'); }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save banner');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (b) => {
    try {
      if (b.active) await adminCatalogService.deactivateBanner(b.id);
      else await adminCatalogService.activateBanner(b.id);
      toast.success(`Banner ${b.active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try { await adminCatalogService.deleteBanner(deleteTarget.id); toast.success('Banner deleted'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete banner'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AdminLayout title="Banners" breadcrumb="Banners">
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition">
          <Plus className="w-4 h-4" /> New Banner
        </button>
      </div>

      <Table headers={['Title', 'Order', 'Active Window', 'Status', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && banners.length === 0} emptyMessage="No banners yet">
        {banners.map((b) => (
          <tr key={b.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{b.title}</td>
            <td className="px-4 py-3 text-slate-500">{b.displayOrder}</td>
            <td className="px-4 py-3 text-slate-500">{b.startDate} → {b.endDate}</td>
            <td className="px-4 py-3"><StatusBadge status={b.active ? 'ACTIVE' : 'BLOCKED'} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(b)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(b)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title={b.active ? 'Deactivate' : 'Activate'}>
                  {b.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setDeleteTarget(b)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Modal isOpen={modalOpen} title={editingId ? 'Edit Banner' : 'New Banner'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Title" required>
            <input className={inputClass} required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </FormField>
          <FormField label="Image URL" required>
            <input className={inputClass} required value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="CTA Text">
              <input className={inputClass} value={form.ctaText} onChange={(e) => setForm({ ...form, ctaText: e.target.value })} />
            </FormField>
            <FormField label="CTA Link">
              <input className={inputClass} value={form.ctaLink} onChange={(e) => setForm({ ...form, ctaLink: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="Display Order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
            </FormField>
            <FormField label="Start Date">
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
            </FormField>
            <FormField label="End Date">
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
            </FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingId ? 'Update Banner' : 'Create Banner'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this banner?" message={`This will permanently delete "${deleteTarget?.title}".`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AdminLayout>
  );
};
