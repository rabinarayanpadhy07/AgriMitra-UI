import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', description: '', imageUrl: '', parentCategoryId: '', displayOrder: 0, active: true };

export const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
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
      const res = await adminCatalogService.listCategories({ search, page, size: 10 });
      setCategories(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); setSearch(searchInput.trim()); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (c) => {
    setEditingId(c.id);
    setForm({
      name: c.name, description: c.description || '', imageUrl: c.imageUrl || '',
      parentCategoryId: c.parentCategoryId || '', displayOrder: c.displayOrder ?? 0, active: c.active,
    });
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...form, parentCategoryId: form.parentCategoryId || null, displayOrder: Number(form.displayOrder) || 0 };
      if (editingId) {
        await adminCatalogService.updateCategory(editingId, payload);
        toast.success('Category updated');
      } else {
        await adminCatalogService.createCategory(payload);
        toast.success('Category created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save category');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (c) => {
    try {
      if (c.active) await adminCatalogService.deactivateCategory(c.id);
      else await adminCatalogService.activateCategory(c.id);
      toast.success(`Category ${c.active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminCatalogService.deleteCategory(deleteTarget.id);
      toast.success('Category deleted');
      setDeleteTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot delete this category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Categories" breadcrumb="Categories">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search categories..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition" />
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition">
          <Plus className="w-4 h-4" /> New Category
        </button>
      </div>

      <Table headers={['Name', 'Parent', 'Status', 'Order', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && categories.length === 0} emptyMessage="No categories yet">
        {categories.map((c) => (
          <tr key={c.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{c.name}</td>
            <td className="px-4 py-3 text-slate-600">{c.parentCategoryName || '—'}</td>
            <td className="px-4 py-3"><StatusBadge status={c.active ? 'ACTIVE' : 'BLOCKED'} /></td>
            <td className="px-4 py-3 text-slate-500">{c.displayOrder}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(c)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(c)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title={c.active ? 'Deactivate' : 'Activate'}>
                  {c.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setDeleteTarget(c)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <Modal isOpen={modalOpen} title={editingId ? 'Edit Category' : 'New Category'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <FormField label="Name" required>
            <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <FormField label="Image URL">
            <input className={inputClass} value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Parent Category">
              <select className={inputClass} value={form.parentCategoryId} onChange={(e) => setForm({ ...form, parentCategoryId: e.target.value })}>
                <option value="">None (top-level)</option>
                {categories.filter((c) => c.id !== editingId).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Display Order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} />
            </FormField>
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingId ? 'Update Category' : 'Create Category'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this category?"
        message={`This will permanently delete "${deleteTarget?.name}". Categories with products or subcategories cannot be deleted.`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AdminLayout>
  );
};
