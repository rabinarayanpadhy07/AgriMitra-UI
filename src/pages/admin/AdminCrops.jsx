import React, { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { Modal, FormField, inputClass } from '../../components/Modal';
import { adminCatalogService } from '../../services/adminCatalogService';
import { Plus, Pencil, Trash2, ChevronDown, ChevronUp, Sprout } from 'lucide-react';
import toast from 'react-hot-toast';

const EMPTY_CROP = { name: '', cropCategory: '', description: '', imageUrl: '' };
const EMPTY_STAGE = { stageName: '', stageOrder: 0, description: '', recommendedProductId: '' };

export const AdminCrops = () => {
  const [crops, setCrops] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);
  const [cropForm, setCropForm] = useState(EMPTY_CROP);
  const [deleteCropTarget, setDeleteCropTarget] = useState(null);

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageCropId, setStageCropId] = useState(null);
  const [editingStageId, setEditingStageId] = useState(null);
  const [stageForm, setStageForm] = useState(EMPTY_STAGE);
  const [deleteStageTarget, setDeleteStageTarget] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminCatalogService.listCrops();
      setCrops(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load crops');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreateCrop = () => { setEditingCropId(null); setCropForm(EMPTY_CROP); setCropModalOpen(true); };
  const openEditCrop = (c) => {
    setEditingCropId(c.id);
    setCropForm({ name: c.name, cropCategory: c.cropCategory || '', description: c.description || '', imageUrl: c.imageUrl || '' });
    setCropModalOpen(true);
  };

  const submitCrop = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingCropId) { await adminCatalogService.updateCrop(editingCropId, cropForm); toast.success('Crop updated'); }
      else { await adminCatalogService.createCrop(cropForm); toast.success('Crop created'); }
      setCropModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save crop');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteCrop = async () => {
    if (!deleteCropTarget) return;
    setIsSubmitting(true);
    try { await adminCatalogService.deleteCrop(deleteCropTarget.id); toast.success('Crop deleted'); setDeleteCropTarget(null); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to delete crop'); }
    finally { setIsSubmitting(false); }
  };

  const openCreateStage = (cropId) => { setStageCropId(cropId); setEditingStageId(null); setStageForm(EMPTY_STAGE); setStageModalOpen(true); };
  const openEditStage = (cropId, s) => {
    setStageCropId(cropId);
    setEditingStageId(s.id);
    setStageForm({ stageName: s.stageName, stageOrder: s.stageOrder, description: s.description || '', recommendedProductId: s.recommendedProductId || '' });
    setStageModalOpen(true);
  };

  const submitStage = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = { ...stageForm, stageOrder: Number(stageForm.stageOrder) || 0, recommendedProductId: stageForm.recommendedProductId || null };
      if (editingStageId) await adminCatalogService.updateCropStage(stageCropId, editingStageId, payload);
      else await adminCatalogService.addCropStage(stageCropId, payload);
      toast.success('Stage saved');
      setStageModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteStage = async () => {
    if (!deleteStageTarget) return;
    setIsSubmitting(true);
    try {
      await adminCatalogService.deleteCropStage(deleteStageTarget.cropId, deleteStageTarget.stage.id);
      toast.success('Stage deleted');
      setDeleteStageTarget(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete stage');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Crops & Crop Guides" breadcrumb="Crops">
      <div className="flex justify-end mb-4">
        <button onClick={openCreateCrop} className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 px-4 py-2.5 rounded-xl shadow-sm cursor-pointer transition">
          <Plus className="w-4 h-4" /> New Crop
        </button>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : crops.length === 0 ? (
        <p className="text-sm text-slate-500">No crops yet.</p>
      ) : (
        <div className="space-y-3">
          {crops.map((c) => (
            <div key={c.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{c.name}</p>
                    <p className="text-xs text-slate-500">{c.cropCategory || 'Uncategorized'} · {c.stages?.length || 0} stage(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => openEditCrop(c)} className="text-slate-500 hover:text-emerald-700 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteCropTarget(c)} className="text-slate-500 hover:text-rose-600 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                  <button onClick={() => setExpandedId(expandedId === c.id ? null : c.id)} className="text-slate-500 hover:text-slate-700 cursor-pointer">
                    {expandedId === c.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="border-t border-slate-100 px-5 py-4 bg-slate-50/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Crop Stages</p>
                    <button onClick={() => openCreateStage(c.id)} className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">+ Add Stage</button>
                  </div>
                  {(!c.stages || c.stages.length === 0) ? (
                    <p className="text-xs text-slate-400">No stages defined yet.</p>
                  ) : (
                    <ol className="space-y-2">
                      {c.stages.map((s) => (
                        <li key={s.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-3 py-2">
                          <div>
                            <p className="text-sm font-medium text-slate-900">{s.stageOrder}. {s.stageName}</p>
                            {s.description && <p className="text-xs text-slate-500">{s.description}</p>}
                            {s.recommendedProductName && <p className="text-xs text-emerald-700">Recommended: {s.recommendedProductName}</p>}
                          </div>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditStage(c.id, s)} className="text-slate-500 hover:text-emerald-700 cursor-pointer"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => setDeleteStageTarget({ cropId: c.id, stage: s })} className="text-slate-500 hover:text-rose-600 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={cropModalOpen} title={editingCropId ? 'Edit Crop' : 'New Crop'} onClose={() => setCropModalOpen(false)}>
        <form onSubmit={submitCrop} className="space-y-4">
          <FormField label="Name" required>
            <input className={inputClass} required value={cropForm.name} onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })} />
          </FormField>
          <FormField label="Crop Category">
            <input className={inputClass} value={cropForm.cropCategory} onChange={(e) => setCropForm({ ...cropForm, cropCategory: e.target.value })} placeholder="e.g. Cereal, Vegetable" />
          </FormField>
          <FormField label="Description">
            <textarea className={inputClass} rows={3} value={cropForm.description} onChange={(e) => setCropForm({ ...cropForm, description: e.target.value })} />
          </FormField>
          <FormField label="Image URL">
            <input className={inputClass} value={cropForm.imageUrl} onChange={(e) => setCropForm({ ...cropForm, imageUrl: e.target.value })} />
          </FormField>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingCropId ? 'Update Crop' : 'Create Crop'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={stageModalOpen} title={editingStageId ? 'Edit Stage' : 'New Stage'} onClose={() => setStageModalOpen(false)}>
        <form onSubmit={submitStage} className="space-y-4">
          <FormField label="Stage Name" required>
            <input className={inputClass} required value={stageForm.stageName} onChange={(e) => setStageForm({ ...stageForm, stageName: e.target.value })} placeholder="e.g. Nursery" />
          </FormField>
          <FormField label="Order">
            <input type="number" className={inputClass} value={stageForm.stageOrder} onChange={(e) => setStageForm({ ...stageForm, stageOrder: e.target.value })} />
          </FormField>
          <FormField label="Description">
            <textarea className={inputClass} rows={3} value={stageForm.description} onChange={(e) => setStageForm({ ...stageForm, description: e.target.value })} />
          </FormField>
          <FormField label="Recommended Product ID">
            <input type="number" className={inputClass} value={stageForm.recommendedProductId} onChange={(e) => setStageForm({ ...stageForm, recommendedProductId: e.target.value })} placeholder="Optional" />
          </FormField>
          <button type="submit" disabled={isSubmitting} className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm disabled:opacity-50 cursor-pointer transition">
            {isSubmitting ? 'Saving...' : editingStageId ? 'Update Stage' : 'Add Stage'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteCropTarget} title="Delete this crop?" message={`This will permanently delete "${deleteCropTarget?.name}" and all its stages.`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDeleteCrop} onCancel={() => setDeleteCropTarget(null)} />
      <ConfirmDialog isOpen={!!deleteStageTarget} title="Delete this stage?" message={`This will permanently delete "${deleteStageTarget?.stage?.stageName}".`}
        confirmText="Delete" danger isSubmitting={isSubmitting} onConfirm={confirmDeleteStage} onCancel={() => setDeleteStageTarget(null)} />
    </AdminLayout>
  );
};
