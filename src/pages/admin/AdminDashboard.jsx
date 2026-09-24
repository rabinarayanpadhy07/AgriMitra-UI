import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Table } from '../../components/Table';
import { StatusBadge } from '../../components/StatusBadge';
import { adminService } from '../../services/adminService';
import toast from 'react-hot-toast';
import {
  Users,
  Store,
  ShieldCheck,
  Clock,
  Ban,
  UserPlus,
  CalendarDays,
  Package,
  ClipboardList,
  Wallet,
  Boxes,
} from 'lucide-react';

const ACCENT_CLASSES = {
  emerald: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  sky: 'bg-sky-50 text-sky-600 border-sky-200',
  violet: 'bg-violet-50 text-violet-600 border-violet-200',
  amber: 'bg-amber-50 text-amber-600 border-amber-200',
  rose: 'bg-rose-50 text-rose-600 border-rose-200',
};

const StatCard = ({ label, value, icon: Icon, accent = 'emerald' }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</span>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${ACCENT_CLASSES[accent]}`}>
        <Icon className="w-4 h-4" />
      </div>
    </div>
    <p className="text-2xl font-extrabold text-slate-900">{value}</p>
  </div>
);

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentSellerApps, setRecentSellerApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const [statsRes, usersRes, sellersRes] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentUsers(),
          adminService.getRecentSellerApplications(),
        ]);
        setStats(statsRes.data);
        setRecentUsers(usersRes.data || []);
        setRecentSellerApps(sellersRes.data || []);
      } catch (err) {
        setIsError(true);
        toast.error(err.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  return (
    <AdminLayout title="Dashboard">
      {/* Live stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Total Users" value={isLoading ? '—' : stats?.totalUsers ?? 0} icon={Users} accent="emerald" />
        <StatCard label="Total Sellers" value={isLoading ? '—' : stats?.totalSellers ?? 0} icon={Store} accent="sky" />
        <StatCard label="Total Admins" value={isLoading ? '—' : stats?.totalAdmins ?? 0} icon={ShieldCheck} accent="violet" />
        <StatCard label="Total Products" value={isLoading ? '—' : stats?.totalProducts ?? 0} icon={Package} accent="emerald" />
        <StatCard label="Total Orders" value={isLoading ? '—' : stats?.totalOrders ?? 0} icon={ClipboardList} accent="sky" />
        <StatCard label="Total Revenue" value={isLoading ? '—' : `₹${stats?.totalRevenue ?? 0}`} icon={Wallet} accent="violet" />
        <StatCard label="Low Stock Products" value={isLoading ? '—' : stats?.lowStockProducts ?? 0} icon={Boxes} accent="amber" />
        <StatCard label="Pending Seller Apps" value={isLoading ? '—' : stats?.pendingSellerApplications ?? 0} icon={Clock} accent="amber" />
        <StatCard label="Blocked Users" value={isLoading ? '—' : stats?.blockedUsers ?? 0} icon={Ban} accent="rose" />
        <StatCard label="New Users Today" value={isLoading ? '—' : stats?.newUsersToday ?? 0} icon={UserPlus} accent="emerald" />
        <StatCard label="New Users This Month" value={isLoading ? '—' : stats?.newUsersThisMonth ?? 0} icon={CalendarDays} accent="emerald" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Recent Users</h2>
            <Link to="/admin/users" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
              View all
            </Link>
          </div>
          <Table
            headers={['Name', 'Email', 'Role', 'Joined']}
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && recentUsers.length === 0}
            emptyMessage="No users yet"
          >
            {recentUsers.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-600 break-all">{u.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.role} />
                </td>
                <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </Table>
        </div>

        {/* Pending Seller Applications */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-slate-900">Pending Seller Applications</h2>
            <Link to="/admin/sellers" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer">
              View all
            </Link>
          </div>
          <Table
            headers={['Name', 'Email', 'Status', 'Applied']}
            isLoading={isLoading}
            isError={isError}
            isEmpty={!isLoading && !isError && recentSellerApps.length === 0}
            emptyMessage="No pending seller applications"
          >
            {recentSellerApps.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-medium text-slate-900">{u.fullName}</td>
                <td className="px-4 py-3 text-slate-600 break-all">{u.email}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.sellerStatus} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {u.sellerAppliedAt ? new Date(u.sellerAppliedAt).toLocaleDateString() : '—'}
                </td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
};
