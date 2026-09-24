import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { shopService } from '../services/shopService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { Pagination } from '../components/Pagination';
import { HeroCarousel } from '../components/HeroCarousel';
import {
  Package,
  Heart,
  ShoppingCart,
  Star,
  Sparkles,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import toast from 'react-hot-toast';

const ProductCard = ({ product, onAddToCart, onToggleWishlist, isWished }) => {
  const price = product.discountPrice ?? product.price;
  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="bg-[#fdfcf9] border border-stone-200/90 rounded-2xl overflow-hidden group hover:shadow-md hover:border-emerald-500/50 transition-all flex flex-col justify-between">
      <div>
        <Link to={`/shop/${product.id}`} className="block aspect-[16/10] sm:aspect-square bg-[#f3f2eb] relative overflow-hidden">
          {product.imageUrls?.[0] ? (
            <img
              src={product.imageUrls[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <Package className="w-10 h-10" />
            </div>
          )}

          {hasDiscount && (
            <span className="absolute top-2 left-2 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
              {discountPercent}% OFF
            </span>
          )}

          {product.featured && (
            <span className="absolute top-2 right-2 bg-emerald-700/90 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" /> Featured
            </span>
          )}
        </Link>

        <div className="p-3.5 space-y-1.5">
          {product.categoryName && (
            <p className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider line-clamp-1">
              {product.categoryName}
            </p>
          )}

          <Link
            to={`/shop/${product.id}`}
            className="text-sm font-bold text-slate-900 line-clamp-2 hover:text-emerald-700 transition leading-snug"
          >
            {product.name}
          </Link>

          {product.crop && (
            <p className="text-xs text-slate-500 line-clamp-1">
              Crop: <strong className="text-slate-700 font-medium">{product.crop}</strong>
              {product.variety ? ` • ${product.variety}` : ''}
            </p>
          )}

          {product.averageRating ? (
            <div className="flex items-center gap-1 text-xs text-amber-500 pt-0.5">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{product.averageRating}</span>
              <span className="text-slate-400">({product.reviewCount || 0})</span>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 pt-0.5">New on AgriMitra</div>
          )}

          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-base font-extrabold text-slate-900">₹{price}</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">₹{product.price}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-3.5 pt-0">
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stockStatus === 'OUT_OF_STOCK'}
            className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed py-2 px-3 rounded-xl cursor-pointer transition shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{product.stockStatus === 'OUT_OF_STOCK' ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
          <button
            onClick={() => onToggleWishlist(product)}
            title={isWished ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`p-2 rounded-xl border cursor-pointer transition ${
              isWished
                ? 'bg-rose-50 border-rose-200 text-rose-600'
                : 'border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50/50'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWished ? 'fill-rose-600 text-rose-600' : ''}`} />
          </button>
        </div>
      </div>
    </div>
  );
};

export const Shop = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart: addItemToCart } = useCart();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Reset pagination when search or category filter changes
  useEffect(() => {
    setPage(0);
  }, [search, categoryId]);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await shopService.getProducts({
        search,
        categoryId: categoryId ? Number(categoryId) : undefined,
        page,
        size: 12,
      });
      setProducts(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [search, categoryId, page]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    shopService
      .getCategories()
      .then((r) => setCategories(r.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    shopService
      .getWishlist()
      .then((r) => setWishlistIds(new Set((r.data || []).map((w) => w.productId))))
      .catch(() => {});
  }, [isAuthenticated]);

  const activeCategory = categories.find((c) => String(c.id) === String(categoryId));

  const clearFilter = (key) => {
    const next = new URLSearchParams(searchParams);
    next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAllFilters = () => {
    const next = new URLSearchParams();
    setSearchParams(next);
  };

  const handleSelectCategory = (newCatId) => {
    const next = new URLSearchParams(searchParams);
    if (!newCatId || String(categoryId) === String(newCatId)) {
      next.delete('category');
    } else {
      next.set('category', String(newCatId));
    }
    next.delete('page');
    setSearchParams(next);

    setTimeout(() => {
      const el = document.getElementById('catalog-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 60);
  };

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart');
      return;
    }
    const success = await addItemToCart(product.id, 1, false);
    if (success) {
      toast.success(`${product.name} added to cart!`);
    }
  };

  const toggleWishlist = async (product) => {
    if (!isAuthenticated) {
      toast.error('Please log in to use your wishlist');
      return;
    }
    try {
      if (wishlistIds.has(product.id)) {
        await shopService.removeFromWishlist(product.id);
        setWishlistIds((prev) => {
          const n = new Set(prev);
          n.delete(product.id);
          return n;
        });
        toast.success('Removed from wishlist');
      } else {
        await shopService.addToWishlist(product.id);
        setWishlistIds((prev) => new Set(prev).add(product.id));
        toast.success('Added to wishlist');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 4-Slide Storytelling Hero Carousel & Quick Category Shortcuts */}
      {!search && (
        <HeroCarousel
          activeCategoryId={categoryId}
          onSelectCategory={handleSelectCategory}
        />
      )}

      {/* Catalog & Filter Section */}
      <div id="catalog-section" className="scroll-mt-28 space-y-6">
        {/* Active Filters Bar (when search or category is active) */}
        {(search || categoryId) && (
          <div className="bg-[#fdfcf9] border border-stone-200/90 rounded-2xl p-4 shadow-2xs flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1.5 text-stone-500 font-semibold mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
              <span>Active Filters:</span>
            </div>

            {search && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium">
                <span>Keyword: <strong>"{search}"</strong></span>
                <button
                  onClick={() => clearFilter('search')}
                  className="hover:text-emerald-950 cursor-pointer p-0.5"
                  title="Remove search"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-medium">
                <span>Category: <strong>{activeCategory.name}</strong></span>
                <button
                  onClick={() => clearFilter('category')}
                  className="hover:text-emerald-950 cursor-pointer p-0.5"
                  title="Remove category filter"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
          </div>

          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition cursor-pointer"
          >
            Clear All Filters
          </button>
        </div>
      )}

      {/* Product Catalog Grid */}
      {isLoading ? (
        <div className="text-center py-20 bg-[#fdfcf9] border border-stone-200/90 rounded-2xl">
          <Package className="w-10 h-10 text-emerald-600 animate-pulse mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading agricultural catalog...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-[#fdfcf9] border border-stone-200/90 rounded-2xl">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No products found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            We couldn't find any products matching your selection. Try clearing your filters or searching for something else.
          </p>
          <button
            onClick={clearAllFilters}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold hover:bg-emerald-500 transition cursor-pointer"
          >
            View All Products
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                {activeCategory
                  ? activeCategory.name
                  : search
                  ? `Search Results for "${search}"`
                  : 'Certified Farm Supplies'}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Showing <strong className="text-slate-800 font-bold">{products.length}</strong> of {totalElements} items
                {activeCategory ? ` in ${activeCategory.name}` : ''}
              </p>
            </div>
            {activeCategory && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 px-3 py-1.5 rounded-xl transition cursor-pointer"
              >
                View All Products
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onAddToCart={addToCart}
                onToggleWishlist={toggleWishlist}
                isWished={wishlistIds.has(p.id)}
              />
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}
      </div>
    </div>
  );
};
