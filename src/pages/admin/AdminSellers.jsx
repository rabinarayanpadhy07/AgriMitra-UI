import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { adminService } from '../../services/adminService';
import { Search, CheckCircle2, XCircle, PauseCircle, PlayCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const ACTION_CONFIG = {
  approve: {
    call: (id) => adminService.approveSeller(id),
    title: 'Approve this seller?',
    message: (name) => `${name} will become an approved seller.`,
    confirmText: 'Approve',
    danger: false,
    successText: (name) => `${name} has been approved as a seller`,
  },
  reject: {
    call: (id) => adminService.rejectSeller(id),
    title: 'Reject this application?',
    message: (name) => `${name}'s seller application will be marked rejected.`,
    confirmText: 'Reject',
    danger: true,
    successText: (name) => `${name}'s seller application was rejected`,
  },
  suspend: {
    call: (id) => adminService.suspendSeller(id),
    title: 'Suspend this seller?',
    message: (name) => `${name} will lose active seller status until reactivated.`,
    confirmText: 'Suspend',
    danger: true,
    successText: (name) => `${name} has been suspended`,
  },
  reactivate: {
    call: (id) => adminService.reactivateSeller(id),
    title: 'Reactivate this seller?',
    message: (name) => `${name} will regain active seller status.`,
    confirmText: 'Reactivate',
    danger: false,
    successText: (name) => `${name} has been reactivated`,
  },
};

export const AdminSellers = () => {
  const [sellers, setSellers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { seller, action }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadSellers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminService.getSellers({
        search,
        status: statusFilter,
        page,
        size: PAGE_SIZE,
      });
      setSellers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load sellers');
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter, page]);

  useEffect(() => {
    loadSellers();
  }, [loadSellers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    const { seller, action } = confirmTarget;
    const config = ACTION_CONFIG[action];
    setIsSubmitting(true);
    try {
      await config.call(seller.id);
      toast.success(config.successText(seller.fullName));
      setConfirmTarget(null);
      loadSellers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderActions = (seller) => {
    switch (seller.sellerStatus) {
      case 'PENDING':
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setConfirmTarget({ seller, action: 'approve' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Approve
            </button>
            <button
              onClick={() => setConfirmTarget({ seller, action: 'reject' })}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
            >
              <XCircle className="w-3.5 h-3.5" />
              Reject
            </button>
          </div>
        );
      case 'APPROVED':
        return (
          <button
            onClick={() => setConfirmTarget({ seller, action: 'suspend' })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            Suspend
          </button>
        );
      case 'SUSPENDED':
        return (
          <button
            onClick={() => setConfirmTarget({ seller, action: 'reactivate' })}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
          >
            <PlayCircle className="w-3.5 h-3.5" />
            Reactivate
          </button>
        );
      default:
        return <span className="text-xs text-slate-400">No action available</span>;
    }
  };

  return (
    <AdminLayout title="Sellers" breadcrumb="Sellers">
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name, email, or mobile..."
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="SUSPENDED">Suspended</option>
        </select>
      </div>

      <Table
        headers={['Name', 'Email', 'Mobile', 'Status', 'Applied', 'Actions']}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && sellers.length === 0}
        emptyMessage="No seller applications found"
      >
        {sellers.map((s) => (
          <tr key={s.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{s.fullName}</td>
            <td className="px-4 py-3 text-slate-600 break-all">{s.email}</td>
            <td className="px-4 py-3 text-slate-600">{s.mobileNumber}</td>
            <td className="px-4 py-3">
              <StatusBadge status={s.sellerStatus} />
            </td>
            <td className="px-4 py-3 text-slate-500">
              {s.sellerAppliedAt ? new Date(s.sellerAppliedAt).toLocaleDateString() : '—'}
            </td>
            <td className="px-4 py-3">{renderActions(s)}</td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget ? ACTION_CONFIG[confirmTarget.action].title : ''}
        message={confirmTarget ? ACTION_CONFIG[confirmTarget.action].message(confirmTarget.seller.fullName) : ''}
        confirmText={confirmTarget ? ACTION_CONFIG[confirmTarget.action].confirmText : ''}
        danger={confirmTarget ? ACTION_CONFIG[confirmTarget.action].danger : false}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </AdminLayout>
  );
};
