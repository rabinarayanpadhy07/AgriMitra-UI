import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { useCart } from '../context/CartContext';
import { Package, Heart, ShoppingCart } from 'lucide-react';
import toast from 'react-hot-toast';

export const Wishlist = () => {
  const { addToCart: addItemToCart } = useCart();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await shopService.getWishlist();
      setItems(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load wishlist');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const remove = async (item) => {
    try { await shopService.removeFromWishlist(item.productId); setItems((prev) => prev.filter((i) => i.id !== item.id)); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed to remove item'); }
  };

  const addToCart = async (item) => {
    await addItemToCart(item.productId, 1);
  };

  if (isLoading) return <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-slate-500">Loading wishlist...</div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Wishlist</h1>

      {items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <Heart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">Your wishlist is empty.</p>
          <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Explore Marketplace &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
              <Link to={`/shop/${item.productId}`} className="block aspect-square bg-slate-100">
                {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><Package className="w-8 h-8" /></div>}
              </Link>
              <div className="p-3">
                <Link to={`/shop/${item.productId}`} className="text-sm font-semibold text-slate-900 line-clamp-1 hover:text-emerald-700">{item.productName}</Link>
                <p className="text-sm font-bold text-slate-900 mt-0.5">₹{item.discountPrice ?? item.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => addToCart(item)} disabled={!item.inStock}
                    className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 py-1.5 rounded-lg cursor-pointer">
                    <ShoppingCart className="w-3.5 h-3.5" /> {item.inStock ? 'Add' : 'Out of stock'}
                  </button>
                  <button onClick={() => remove(item)} className="text-slate-400 hover:text-rose-600 cursor-pointer text-xs">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
