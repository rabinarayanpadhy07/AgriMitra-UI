import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { StatusBadge } from '../components/StatusBadge';
import { Pagination } from '../components/Pagination';
import { ClipboardList } from 'lucide-react';
import toast from 'react-hot-toast';

export const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    shopService.getMyOrders({ page, size: 10 })
      .then((res) => { setOrders(res.data.content || []); setTotalPages(res.data.totalPages || 0); })
      .catch((err) => toast.error(err.response?.data?.message || 'Failed to load orders'))
      .finally(() => setIsLoading(false));
  }, [page]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Orders</h1>

      {isLoading ? (
        <p className="text-sm text-slate-500">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <ClipboardList className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">You haven't placed any orders yet.</p>
          <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Explore Marketplace &rarr;</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o) => (
            <Link to={`/orders/${o.id}`} key={o.id} className="flex items-center justify-between bg-white border border-slate-200 rounded-xl p-4 hover:border-emerald-300 transition">
              <div>
                <p className="text-sm font-semibold text-slate-900">Order #{o.id}</p>
                <p className="text-xs text-slate-500">{new Date(o.createdAt).toLocaleDateString()} · {o.items?.length || 0} item(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={o.status} />
                <span className="text-sm font-bold text-slate-900">₹{o.totalAmount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};
