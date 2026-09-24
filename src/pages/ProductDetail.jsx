import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Package, Heart, ShoppingCart, Star, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProductDetail = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart: addItemToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [isWished, setIsWished] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  useEffect(() => {
    shopService.getProduct(id).then((r) => setProduct(r.data)).catch(() => toast.error('Product not found'));
    shopService.getProductReviews(id, { size: 20 }).then((r) => setReviews(r.data.content || [])).catch(() => {});
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    shopService.getWishlist().then((r) => setIsWished((r.data || []).some((w) => w.productId === Number(id)))).catch(() => {});
  }, [id, isAuthenticated]);

  if (!product) return <div className="max-w-5xl mx-auto px-4 py-10 text-sm text-slate-500">Loading...</div>;

  const price = product.discountPrice ?? product.price;

  const addToCart = async () => {
    if (!isAuthenticated) { toast.error('Please log in to add items to your cart'); return; }
    await addItemToCart(product.id, quantity);
  };

  const toggleWishlist = async () => {
    if (!isAuthenticated) { toast.error('Please log in to use your wishlist'); return; }
    try {
      if (isWished) { await shopService.removeFromWishlist(product.id); setIsWished(false); }
      else { await shopService.addToWishlist(product.id); setIsWished(true); }
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update wishlist'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      await shopService.submitReview({ productId: product.id, rating: reviewForm.rating, comment: reviewForm.comment });
      toast.success('Review submitted for moderation');
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const agriFields = [
    ['Crop', product.crop], ['Crop Type', product.cropType], ['Variety', product.variety],
    ['Season', product.season], ['Soil Type', product.soilType], ['Growing Duration', product.growingDuration],
    ['Dosage', product.dosage], ['Manufacturer', product.manufacturer], ['Suitable Region', product.suitableRegion],
  ].filter(([, v]) => v);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/" className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-emerald-700 transition">&larr; Back to Marketplace</Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
          {product.imageUrls?.[0] ? (
            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <Package className="w-16 h-16 text-slate-300" />
          )}
        </div>

        <div className="space-y-4">
          <div>
            {product.categoryName && <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">{product.categoryName}</p>}
            <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
            {product.averageRating && (
              <div className="flex items-center gap-1 text-sm text-amber-500 mt-1">
                <Star className="w-4 h-4 fill-amber-500" /> {product.averageRating} ({product.reviewCount} reviews)
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-2xl font-extrabold text-slate-900">₹{price}</span>
            {product.discountPrice && <span className="text-sm text-slate-400 line-through">₹{product.price}</span>}
          </div>

          <p className="text-sm text-slate-600">{product.description}</p>

          <div className="text-xs font-semibold">
            {product.stockStatus === 'OUT_OF_STOCK' ? <span className="text-rose-600">Out of stock</span>
              : product.stockStatus === 'LOW_STOCK' ? <span className="text-amber-600">Only {product.stock} left</span>
              : <span className="text-emerald-700">In stock</span>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center border border-slate-300 rounded-lg">
              <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="p-2 text-slate-500 hover:text-slate-700 cursor-pointer"><Minus className="w-3.5 h-3.5" /></button>
              <span className="w-8 text-center text-sm">{quantity}</span>
              <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="p-2 text-slate-500 hover:text-slate-700 cursor-pointer"><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <button onClick={addToCart} disabled={product.stockStatus === 'OUT_OF_STOCK'}
              className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 disabled:opacity-40 py-2.5 rounded-xl cursor-pointer transition">
              <ShoppingCart className="w-4 h-4" /> Add to Cart
            </button>
            <button onClick={toggleWishlist} className={`p-2.5 rounded-xl border cursor-pointer transition ${isWished ? 'bg-rose-50 border-rose-200 text-rose-600' : 'border-slate-300 text-slate-500 hover:text-rose-600'}`}>
              <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600' : ''}`} />
            </button>
          </div>

          {agriFields.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs">
              {agriFields.map(([label, value]) => (
                <div key={label}><span className="text-slate-500">{label}:</span> <span className="font-medium text-slate-800">{value}</span></div>
              ))}
            </div>
          )}
          {product.usageInstructions && (
            <div className="text-xs text-slate-600"><span className="font-semibold text-slate-800">Usage: </span>{product.usageInstructions}</div>
          )}
        </div>
      </div>

      <div className="border-t border-slate-200 pt-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">Customer Reviews</h2>

        {isAuthenticated && (
          <form onSubmit={submitReview} className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewForm({ ...reviewForm, rating: n })} className="cursor-pointer">
                  <Star className={`w-5 h-5 ${n <= reviewForm.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-200'}`} />
                </button>
              ))}
            </div>
            <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Share your experience with this product..." rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            <button type="submit" disabled={isSubmittingReview} className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg cursor-pointer disabled:opacity-50">
              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-400">No reviews yet. Be the first to review this product.</p>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-900">{r.userName}</span>
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`w-3 h-3 ${i < r.rating ? 'fill-amber-500' : 'text-slate-200'}`} />)}
                  </div>
                </div>
                <p className="text-xs text-slate-600">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
