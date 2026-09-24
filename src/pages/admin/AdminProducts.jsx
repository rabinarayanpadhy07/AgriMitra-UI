import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { adminService } from '../../services/adminService';
import { Search, Plus, Pencil, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', sku: '', price: '', discountPrice: '', stock: 0, lowStockThreshold: 5,
  categoryId: '', sellerId: '', imageUrls: '', active: true, featured: false,
  crop: '', cropType: '', variety: '', season: '', soilType: '', growingDuration: '',
  usageInstructions: '', dosage: '', composition: '', manufacturer: '', suitableRegion: '',
};

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [showAgri, setShowAgri] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listProducts({ search, active: activeFilter, page, size: 10 });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [search, activeFilter, page]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(0); setSearch(searchInput.trim()); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);
  useEffect(() => {
    adminCatalogService.listCategories({ size: 100 }).then((r) => setCategories(r.data.content || [])).catch(() => {});
    adminService.getSellers({ status: 'APPROVED', size: 100 }).then((r) => setSellers(r.data.content || [])).catch(() => {});
  }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setShowAgri(false); setModalOpen(true); };
  const openEdit = (p) => {
    setEditingId(p.id);
    setForm({
      name: p.name, description: p.description || '', sku: p.sku, price: p.price, discountPrice: p.discountPrice ?? '',
      stock: p.stock, lowStockThreshold: p.lowStockThreshold, categoryId: p.categoryId || '', sellerId: p.sellerId || '',
      imageUrls: (p.imageUrls || []).join(', '), active: p.active, featured: p.featured,
      crop: p.crop || '', cropType: p.cropType || '', variety: p.variety || '', season: p.season || '',
      soilType: p.soilType || '', growingDuration: p.growingDuration || '', usageInstructions: p.usageInstructions || '',
      dosage: p.dosage || '', composition: p.composition || '', manufacturer: p.manufacturer || '', suitableRegion: p.suitableRegion || '',
    });
    setShowAgri(false);
    setModalOpen(true);
  };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        discountPrice: form.discountPrice === '' ? null : Number(form.discountPrice),
        stock: Number(form.stock) || 0,
        lowStockThreshold: Number(form.lowStockThreshold) || 5,
        categoryId: form.categoryId || null,
        sellerId: form.sellerId || null,
        imageUrls: form.imageUrls ? form.imageUrls.split(',').map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editingId) {
        await adminCatalogService.updateProduct(editingId, payload);
        toast.success('Product updated');
      } else {
        await adminCatalogService.createProduct(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      if (p.active) await adminCatalogService.deactivateProduct(p.id);
      else await adminCatalogService.activateProduct(p.id);
      toast.success(`Product ${p.active ? 'deactivated' : 'activated'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const toggleFeatured = async (p) => {
    try {
      if (p.featured) await adminCatalogService.unfeatureProduct(p.id);
      else await adminCatalogService.featureProduct(p.id);
      toast.success(`Product ${p.featured ? 'unfeatured' : 'featured'}`);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try {
      await adminCatalogService.deleteProduct(deleteTarget.id);
      toast.success('Product deleted');
      setDeleteTarget(null);
      load();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to delete product'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AdminLayout title="Products" breadcrumb="Products">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition" />
        </div>
        <select value={activeFilter} onChange={(e) => { setPage(0); setActiveFilter(e.target.value); }} className={inputClass + ' sm:w-44 cursor-pointer'}>
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition whitespace-nowrap">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      <Table headers={['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status', 'Actions']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && products.length === 0} emptyMessage="No products yet">
        {products.map((p) => (
          <tr key={p.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">
              <div className="flex items-center gap-1.5">
                {p.featured && <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
                {p.name}
              </div>
            </td>
            <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.sku}</td>
            <td className="px-4 py-3 text-slate-600">{p.categoryName || '—'}</td>
            <td className="px-4 py-3 text-slate-600">₹{p.discountPrice ?? p.price}</td>
            <td className="px-4 py-3"><StatusBadge status={p.stockStatus} /></td>
            <td className="px-4 py-3"><StatusBadge status={p.active ? 'ACTIVE' : 'BLOCKED'} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <button onClick={() => openEdit(p)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => toggleActive(p)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title={p.active ? 'Deactivate' : 'Activate'}>
                  {p.active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => toggleFeatured(p)} className={`cursor-pointer ${p.featured ? 'text-amber-500' : 'text-slate-500 hover:text-amber-500'}`} title={p.featured ? 'Unfeature' : 'Feature'}>
                  <Star className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteTarget(p)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
              </div>
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <Modal isOpen={modalOpen} title={editingId ? 'Edit Product' : 'New Product'} onClose={() => setModalOpen(false)} maxWidth="max-w-2xl">
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Name" required>
              <input className={inputClass} required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </FormField>
            <FormField label="SKU" required>
              <input className={inputClass} required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </FormField>
          </div>
          <FormField label="Description">
            <textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </FormField>
          <div className="grid grid-cols-4 gap-3">
            <FormField label="Price" required>
              <input type="number" step="0.01" className={inputClass} required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </FormField>
            <FormField label="Discount Price">
              <input type="number" step="0.01" className={inputClass} value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} />
            </FormField>
            <FormField label="Stock">
              <input type="number" className={inputClass} value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </FormField>
            <FormField label="Low Stock At">
              <input type="number" className={inputClass} value={form.lowStockThreshold} onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })} />
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Category">
              <select className={inputClass} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                <option value="">None</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FormField>
            <FormField label="Seller">
              <select className={inputClass} value={form.sellerId} onChange={(e) => setForm({ ...form, sellerId: e.target.value })}>
                <option value="">None (platform-owned)</option>
                {sellers.map((s) => <option key={s.id} value={s.id}>{s.fullName}</option>)}
              </select>
            </FormField>
          </div>
          <FormField label="Image URLs (comma-separated)">
            <input className={inputClass} value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} placeholder="https://... , https://..." />
          </FormField>
          <div className="flex items-center gap-5">
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} /> Active
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} /> Featured
            </label>
          </div>

          <button type="button" onClick={() => setShowAgri(!showAgri)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
            {showAgri ? 'Hide' : 'Show'} agriculture-specific details
          </button>

          {showAgri && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
              <FormField label="Crop"><input className={inputClass} value={form.crop} onChange={(e) => setForm({ ...form, crop: e.target.value })} /></FormField>
              <FormField label="Crop Type"><input className={inputClass} value={form.cropType} onChange={(e) => setForm({ ...form, cropType: e.target.value })} /></FormField>
              <FormField label="Variety"><input className={inputClass} value={form.variety} onChange={(e) => setForm({ ...form, variety: e.target.value })} /></FormField>
              <FormField label="Season"><input className={inputClass} value={form.season} onChange={(e) => setForm({ ...form, season: e.target.value })} /></FormField>
              <FormField label="Soil Type"><input className={inputClass} value={form.soilType} onChange={(e) => setForm({ ...form, soilType: e.target.value })} /></FormField>
              <FormField label="Growing Duration"><input className={inputClass} value={form.growingDuration} onChange={(e) => setForm({ ...form, growingDuration: e.target.value })} /></FormField>
              <FormField label="Dosage"><input className={inputClass} value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} /></FormField>
              <FormField label="Manufacturer"><input className={inputClass} value={form.manufacturer} onChange={(e) => setForm({ ...form, manufacturer: e.target.value })} /></FormField>
              <FormField label="Suitable Region"><input className={inputClass} value={form.suitableRegion} onChange={(e) => setForm({ ...form, suitableRegion: e.target.value })} /></FormField>
              <div className="col-span-2"><FormField label="Composition"><textarea className={inputClass} rows={2} value={form.composition} onChange={(e) => setForm({ ...form, composition: e.target.value })} /></FormField></div>
              <div className="col-span-2"><FormField label="Usage Instructions"><textarea className={inputClass} rows={2} value={form.usageInstructions} onChange={(e) => setForm({ ...form, usageInstructions: e.target.value })} /></FormField></div>
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this product?" message={`This will permanently delete "${deleteTarget?.name}".`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </AdminLayout>
  );
};
