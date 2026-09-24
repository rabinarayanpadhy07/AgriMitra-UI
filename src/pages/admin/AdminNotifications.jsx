import React, { useEffect, useState, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { Pagination } from '../../components/Pagination';
import { StatusBadge } from '../../components/StatusBadge';
import { adminCatalogService } from '../../services/adminCatalogService';
import { CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    try {
      const res = await adminCatalogService.listNotifications({ page, size: 15 });
      setNotifications(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      setIsError(true);
      toast.error(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const markRead = async (n) => {
    try { await adminCatalogService.markNotificationRead(n.id); load(); }
    catch (err) { toast.error(err.response?.data?.message || 'Action failed'); }
  };

  return (
    <AdminLayout title="Notifications" breadcrumb="Notifications">
      <Table headers={['Type', 'Title', 'Message', 'Status', 'Date', '']} isLoading={isLoading} isError={isError}
        isEmpty={!isLoading && !isError && notifications.length === 0} emptyMessage="No notifications yet">
        {notifications.map((n) => (
          <tr key={n.id} className={`hover:bg-slate-50 ${!n.isRead ? 'bg-emerald-50/30' : ''}`}>
            <td className="px-4 py-3"><StatusBadge status={n.type} /></td>
            <td className="px-4 py-3 font-medium text-slate-900">{n.title}</td>
            <td className="px-4 py-3 text-slate-600 max-w-md truncate" title={n.message}>{n.message}</td>
            <td className="px-4 py-3">
              <span className={`text-xs font-semibold ${n.isRead ? 'text-slate-400' : 'text-emerald-700'}`}>
                {n.isRead ? 'Read' : 'Unread'}
              </span>
            </td>
            <td className="px-4 py-3 text-slate-500">{new Date(n.createdAt).toLocaleString()}</td>
            <td className="px-4 py-3">
              {!n.isRead && (
                <button onClick={() => markRead(n)} className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Mark read
                </button>
              )}
            </td>
          </tr>
        ))}
      </Table>

      <Pagination page={page} totalPages={totalPages} totalElements={totalElements} onPageChange={setPage} />
    </AdminLayout>
  );
};
