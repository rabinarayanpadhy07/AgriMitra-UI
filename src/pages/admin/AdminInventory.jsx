import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Boxes } from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = [
  { key: 'low', label: 'Low Stock' },
  { key: 'out', label: 'Out of Stock' },
  { key: 'transactions', label: 'Transaction History' },
];

export const AdminInventory = () => {
  const [tab, setTab] = useState('low');
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState(null);
  const [form, setForm] = useState({ changeType: 'ADD', quantity: 0, reason: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      let res;
      if (tab === 'low') res = await adminCatalogService.lowStock({ page, size: 10 });
      else if (tab === 'out') res = await adminCatalogService.outOfStock({ page, size: 10 });
      else res = await adminCatalogService.transactions({ page, size: 10 });
      setRows(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load inventory data');
    } finally {
      setIsLoading(false);
    }
  }, [tab, page]);

  useEffect(() => { load(); }, [load]);

  const switchTab = (key) => { setTab(key); setPage(0); };

  const openAdjust = (product) => {
    setAdjustTarget(product);
    setForm({ changeType: 'ADD', quantity: 0, reason: '' });
  };

  const submitAdjust = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await adminCatalogService.adjustStock(adjustTarget.id, { ...form, quantity: Number(form.quantity) });
      toast.success('Stock updated');
      setAdjustTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update stock');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Inventory" breadcrumb="Inventory">
      <div className="flex gap-2 mb-4 border-b border-slate-200">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => switchTab(t.key)}
            className={`px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px cursor-pointer transition ${
              tab === t.key ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'transactions' ? (
        <Table headers={['Product', 'Change', 'Quantity', 'Resulting Stock', 'Reason', 'By', 'Date']}
          isLoading={isLoading} isError={isError} isEmpty={!isLoading && !isError && rows.length === 0} emptyMessage="No transactions yet">
          {rows.map((t) => (
            <tr key={t.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{t.productName}</td>
              <td className="px-4 py-3"><StatusBadge status={t.changeType} /></td>
              <td className="px-4 py-3 text-slate-600">{t.quantityChange > 0 ? `+${t.quantityChange}` : t.quantityChange}</td>
              <td className="px-4 py-3 text-slate-600">{t.resultingStock}</td>
              <td className="px-4 py-3 text-slate-500">{t.reason || '—'}</td>
              <td className="px-4 py-3 text-slate-500">{t.performedByName || 'System'}</td>
              <td className="px-4 py-3 text-slate-500">{new Date(t.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </Table>
      ) : (
        <Table headers={['Product', 'SKU', 'Stock', 'Threshold', 'Status', 'Actions']}
          isLoading={isLoading} isError={isError} isEmpty={!isLoading && !isError && rows.length === 0}
          emptyMessage={tab === 'low' ? 'No low-stock products' : 'No out-of-stock products'}>
          {rows.map((p) => (
            <tr key={p.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 font-medium text-slate-900">{p.name}</td>
              <td className="px-4 py-3 text-slate-600 font-mono text-xs">{p.sku}</td>
              <td className="px-4 py-3 text-slate-600">{p.stock}</td>
              <td className="px-4 py-3 text-slate-500">{p.lowStockThreshold}</td>
              <td className="px-4 py-3"><StatusBadge status={p.stockStatus} /></td>
              <td className="px-4 py-3">
                <button onClick={() => openAdjust(p)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
                  <Boxes className="w-3.5 h-3.5" /> Adjust Stock
                </button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <Modal isOpen={!!adjustTarget} title={`Adjust Stock — ${adjustTarget?.name}`} onClose={() => setAdjustTarget(null)}>
        <form onSubmit={submitAdjust} className="space-y-4">
          <FormField label="Change Type" required>
            <select className={inputClass} value={form.changeType} onChange={(e) => setForm({ ...form, changeType: e.target.value })}>
              <option value="ADD">Add stock</option>
              <option value="REMOVE">Remove stock</option>
              <option value="ADJUST">Set exact stock</option>
            </select>
          </FormField>
          <FormField label="Quantity" required>
            <input type="number" min="0" className={inputClass} required value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
          </FormField>
          <FormField label="Reason">
            <input className={inputClass} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Restock from supplier" />
          </FormField>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : 'Update Stock'}
          </button>
        </form>
      </Modal>
    </AdminLayout>
  );
};
