import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Package, Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';

export const Cart = () => {
  const { cart, isLoading, refreshCart, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const updateQty = (item, quantity) => {
    updateQuantity(item.id, quantity);
  };

  const removeItem = (item) => {
    removeFromCart(item.id);
  };

  if (isLoading && !cart) return <div className="max-w-4xl mx-auto px-4 py-10 text-sm text-slate-500">Loading cart...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Your Cart</h1>

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl">
          <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500 mb-4">Your cart is empty.</p>
          <Link to="/" className="text-sm font-semibold text-emerald-700 hover:text-emerald-800">Explore Marketplace &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl p-4">
                <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                  {item.productImage ? <img src={item.productImage} alt="" className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-slate-300" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{item.productName}</p>
                  <p className="text-xs text-slate-500">₹{item.unitPrice} each</p>
                </div>
                <div className="flex items-center border border-slate-300 rounded-lg">
                  <button onClick={() => updateQty(item, item.quantity - 1)} className="p-1.5 text-slate-500 hover:text-slate-700 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="w-7 text-center text-sm">{item.quantity}</span>
                  <button onClick={() => updateQty(item, item.quantity + 1)} disabled={item.quantity >= item.availableStock} className="p-1.5 text-slate-500 hover:text-slate-700 disabled:opacity-30 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-sm font-bold text-slate-900 w-16 text-right">₹{item.lineTotal}</p>
                <button onClick={() => removeItem(item)} className="text-slate-400 hover:text-rose-600 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 h-fit space-y-3">
            <div className="flex justify-between text-sm text-slate-600">
              <span>Subtotal ({cart.itemCount} items)</span>
              <span className="font-semibold text-slate-900">₹{cart.subtotal}</span>
            </div>
            <p className="text-xs text-slate-400">Shipping and discounts calculated at checkout.</p>
            <button onClick={() => navigate('/checkout')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white font-semibold shadow-sm cursor-pointer transition">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
