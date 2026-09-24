import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { StatusBadge } from '../../components/StatusBadge';
import { adminService } from '../../services/adminService';
import { Search, Ban, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

export const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState(null); // { user, action }
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminService.getUsers({
        search,
        role: roleFilter,
        status: statusFilter,
        page,
        size: PAGE_SIZE,
      });
      setUsers(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce search input -> search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(0);
      setSearch(searchInput.trim());
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleConfirm = async () => {
    if (!confirmTarget) return;
    setIsSubmitting(true);
    try {
      const { user, action } = confirmTarget;
      if (action === 'block') {
        await adminService.blockUser(user.id);
        toast.success(`${user.fullName} has been blocked`);
      } else {
        await adminService.unblockUser(user.id);
        toast.success(`${user.fullName} has been unblocked`);
      }
      setConfirmTarget(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout title="Users" breadcrumb="Users">
      {/* Filters */}
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
          value={roleFilter}
          onChange={(e) => {
            setPage(0);
            setRoleFilter(e.target.value);
          }}
          className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition cursor-pointer"
        >
          <option value="">All roles</option>
          <option value="USER">User</option>
          <option value="SELLER">Seller</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setPage(0);
            setStatusFilter(e.target.value);
          }}
          className="px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:border-emerald-600 focus:ring-emerald-500/20 transition cursor-pointer"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <Table
        headers={['Name', 'Email', 'Mobile', 'Role', 'Status', 'Joined', 'Actions']}
        isLoading={isLoading}
        isError={isError}
        isEmpty={!isLoading && !isError && users.length === 0}
        emptyMessage="No users match your filters"
      >
        {users.map((u) => (
          <tr key={u.id} className="hover:bg-slate-50">
            <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
            <td className="px-4 py-3 text-slate-600 break-all">{u.email}</td>
            <td className="px-4 py-3 text-slate-600">{u.mobileNumber}</td>
            <td className="px-4 py-3">
              <StatusBadge status={u.role} />
            </td>
            <td className="px-4 py-3">
              <StatusBadge status={u.accountStatus} />
            </td>
            <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
            <td className="px-4 py-3">
              {u.accountStatus === 'BLOCKED' ? (
                <button
                  onClick={() => setConfirmTarget({ user: u, action: 'unblock' })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Unblock
                </button>
              ) : (
                <button
                  onClick={() => setConfirmTarget({ user: u, action: 'block' })}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 cursor-pointer"
                >
                  <Ban className="w-3.5 h-3.5" />
                  Block
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!confirmTarget}
        title={confirmTarget?.action === 'block' ? 'Block this user?' : 'Unblock this user?'}
        message={
          confirmTarget?.action === 'block'
            ? `${confirmTarget?.user.fullName} will be signed out everywhere and won't be able to log in until unblocked.`
            : `${confirmTarget?.user.fullName} will be able to log in again.`
        }
        confirmText={confirmTarget?.action === 'block' ? 'Block user' : 'Unblock user'}
        danger={confirmTarget?.action === 'block'}
        isSubmitting={isSubmitting}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmTarget(null)}
      />
    </AdminLayout>
  );
};
