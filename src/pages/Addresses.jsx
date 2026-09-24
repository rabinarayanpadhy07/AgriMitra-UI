import React, { useEffect, useState } from 'react';
import { shopService } from '../services/shopService';
import { Modal, FormField, inputClass } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { Plus, Pencil, Trash2, MapPin, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_FORM = { fullName: '', phone: '', line1: '', line2: '', city: '', state: '', pincode: '', country: 'India', isDefault: false };

export const Addresses = () => {
  const [addresses, setAddresses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await shopService.getAddresses();
      setAddresses(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditingId(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (a) => { setEditingId(a.id); setForm({ ...a }); setModalOpen(true); };

  const submit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) { await shopService.updateAddress(editingId, form); toast.success('Address updated'); }
      else { await shopService.createAddress(form); toast.success('Address added'); }
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setDefault = async (a) => {
    try { await shopService.setDefaultAddress(a.id); toast.success('Default address updated'); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsSubmitting(true);
    try { await shopService.deleteAddress(deleteTarget.id); toast.success('Address deleted'); setDeleteTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete address'); }
    finally { setIsSubmitting(false); }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Your Addresses</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition">
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : addresses.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No addresses saved yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className={`bg-white border rounded-2xl p-4 ${a.isDefault ? 'border-emerald-300 ring-1 ring-emerald-200' : 'border-slate-200'}`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-semibold text-slate-900">{a.fullName}</p>
                {a.isDefault && <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">DEFAULT</span>}
              </div>
              <p className="text-xs text-slate-600">{a.phone}</p>
              <p className="text-xs text-slate-600 mt-1">{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>
              <p className="text-xs text-slate-600">{a.city}, {a.state} {a.pincode}, {a.country}</p>
              <div className="flex items-center gap-3 mt-3">
                <button onClick={() => openEdit(a)} className="text-xs font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"><Pencil className="w-3 h-3" /> Edit</button>
                {!a.isDefault && (
                  <button onClick={() => setDefault(a)} className="text-xs font-semibold text-slate-500 hover:text-emerald-700 cursor-pointer inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Set default</button>
                )}
                <button onClick={() => setDeleteTarget(a)} className="text-xs font-semibold text-slate-500 hover:text-rose-600 cursor-pointer inline-flex items-center gap-1"><Trash2 className="w-3 h-3" /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} title={editingId ? 'Edit Address' : 'New Address'} onClose={() => setModalOpen(false)}>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Full Name" required><input className={inputClass} required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></FormField>
            <FormField label="Phone" required><input className={inputClass} required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></FormField>
          </div>
          <FormField label="Address Line 1" required><input className={inputClass} required value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} /></FormField>
          <FormField label="Address Line 2"><input className={inputClass} value={form.line2} onChange={(e) => setForm({ ...form, line2: e.target.value })} /></FormField>
          <div className="grid grid-cols-3 gap-3">
            <FormField label="City" required><input className={inputClass} required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></FormField>
            <FormField label="State" required><input className={inputClass} required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} /></FormField>
            <FormField label="Pincode" required><input className={inputClass} required value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} /></FormField>
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> Set as default address
          </label>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} title="Delete this address?" message="This address will be permanently removed."
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};
