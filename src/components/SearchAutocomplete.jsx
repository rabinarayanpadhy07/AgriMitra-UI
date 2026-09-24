import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Package, ArrowRight, TrendingUp, Sparkles, Loader2 } from 'lucide-react';
import { shopService } from '../services/shopService';

const TRENDING_SEARCHES = [
  'Hybrid Wheat Seeds',
  'Basmati Paddy Seeds',
  'Organic Neem Cake Fertilizer',
  'Soluble NPK 19:19:19',
  'Bio-Shield Insecticide',
  'Battery Knapsack Sprayer',
];

export const SearchAutocomplete = ({
  initialQuery = '',
  onSearchSubmit,
  onSelectProduct,
  onClear,
  autoFocus = false,
  className = '',
  placeholder = 'Search seeds, fertilizers, crop protection, equipment...',
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync with initialQuery when it changes externally
  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  // Auto-focus if requested
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await shopService.getProducts({ search: trimmed, page: 0, size: 6 });
        setResults(res.data?.content || []);
      } catch {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(query.trim());
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    if (onClear) {
      onClear();
    }
    inputRef.current?.focus();
  };

  const handleSelectTrending = (term) => {
    setQuery(term);
    setIsOpen(false);
    if (onSearchSubmit) {
      onSearchSubmit(term);
    }
  };

  const handleProductClick = (product) => {
    setIsOpen(false);
    if (onSelectProduct) {
      onSelectProduct(product);
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 1. Search Input Bar */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-stone-400 pointer-events-none group-focus-within:text-emerald-600 transition-colors" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-9 py-2 bg-[#f0eee6] hover:bg-[#eae7dd] focus:bg-white border border-stone-200/90 focus:border-emerald-600 rounded-full text-xs sm:text-sm text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition shadow-2xs"
        />

        {/* Loading Spinner or Clear Button */}
        <div className="absolute right-3 flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-emerald-600 animate-spin" />
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </form>

      {/* 2. Flipkart-Style Suggestions Dropdown (Directly Attached Below) */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200/90 rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[75vh] flex flex-col">
          {/* A. If Query is Active and Results Found */}
          {query.trim() && results.length > 0 && (
            <div className="overflow-y-auto divide-y divide-stone-100">
              <div className="px-3.5 py-2 bg-stone-50/70 border-b border-stone-100 flex items-center justify-between">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  Products ({results.length})
                </span>
                <span className="text-[11px] text-stone-400">Press Enter to search all</span>
              </div>

              {/* Product Suggestion Cards */}
              <div className="py-1">
                {results.map((product) => {
                  const price = product.discountPrice ?? product.price;
                  const hasDiscount = product.discountPrice != null && product.discountPrice < product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
                    : 0;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleProductClick(product)}
                      className="px-3.5 py-2.5 flex items-center justify-between gap-3 hover:bg-emerald-50/60 cursor-pointer transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Thumbnail */}
                        <div className="w-10 h-10 rounded-lg bg-stone-100 border border-stone-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imageUrls?.[0] ? (
                            <img
                              src={product.imageUrls[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <Package className="w-5 h-5 text-stone-300" />
                          )}
                        </div>

                        {/* Title and Category */}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-emerald-700 truncate leading-tight">
                            {product.name}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mt-0.5 truncate">
                            {product.categoryName && (
                              <span className="font-medium text-emerald-800">
                                {product.categoryName}
                              </span>
                            )}
                            {product.crop && <span>• {product.crop}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Price & Discount */}
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end">
                          <span className="text-xs sm:text-sm font-bold text-slate-900">
                            ₹{price}
                          </span>
                          {hasDiscount && (
                            <span className="text-[10px] text-stone-400 line-through">
                              ₹{product.price}
                            </span>
                          )}
                        </div>
                        {hasDiscount && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1 py-0.2 rounded">
                            {discountPercent}% OFF
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* View All Matching Products in Catalog CTA */}
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full px-3.5 py-2.5 bg-stone-50 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center justify-between transition cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <Search className="w-3.5 h-3.5" />
                  <span className="truncate">View all results matching "{query}"</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          )}

          {/* B. If Query is Active but No Results Found */}
          {query.trim() && !isLoading && results.length === 0 && (
            <div className="p-6 text-center space-y-1.5">
              <Package className="w-8 h-8 text-stone-300 mx-auto mb-1" />
              <p className="text-xs sm:text-sm font-bold text-slate-800">
                No products found for "{query}"
              </p>
              <p className="text-xs text-stone-500 max-w-xs mx-auto">
                Try searching general agricultural terms like Wheat, Urea, Neem, Sprayer, or Hybrid.
              </p>
            </div>
          )}

          {/* C. If Query is Empty — Show Trending / Popular Agricultural Searches */}
          {!query.trim() && (
            <div className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-stone-500 text-[11px] font-bold uppercase tracking-wider">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trending Searches in AgriMitra</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTrending(term)}
                    className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 border border-stone-200/70 text-xs font-medium text-stone-700 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3 text-stone-400" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
