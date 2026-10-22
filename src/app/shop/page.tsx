'use client';

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Search, RotateCcw } from 'lucide-react';
import ProductCard from '@/components/product/ProductCard';
import { mockCategories, mockProducts } from '@/data/mockData';
import { ProductCategory, Product } from '@/types';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const initialQuery = searchParams.get('q') || '';

  const [categories, setCategories] = useState<ProductCategory[]>(mockCategories);
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState<boolean>(false);

  // Sync category from URL if changed
  useEffect(() => {
    const cat = searchParams.get('category');
    if (cat) setSelectedCategory(cat);
  }, [searchParams]);

  // Fetch live categories and products
  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          fetch('/api/categories'),
          fetch('/api/admin/products'),
        ]);

        if (catRes.ok) {
          const catData = await catRes.json();
          if (catData.success && Array.isArray(catData.categories)) {
            setCategories(catData.categories);
          }
        }

        if (prodRes.ok) {
          const prodData = await prodRes.json();
          if (prodData.success && Array.isArray(prodData.products)) {
            setProducts(prodData.products);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch dynamic shop data:', e);
      }
    }
    loadData();
  }, []);

  // Filter products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (selectedCategory !== 'all') {
          const catObj = categories.find((c) => c.slug === selectedCategory);
          if (catObj) {
            const matchesId = product.categoryId === catObj.id;
            const matchesName = product.category?.toLowerCase() === catObj.name.toLowerCase();
            const matchesSlug = product.category?.toLowerCase() === catObj.slug.toLowerCase();
            if (!matchesId && !matchesName && !matchesSlug) {
              return false;
            }
          }
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = product.title.toLowerCase().includes(q);
          const matchesDesc = product.description.toLowerCase().includes(q);
          const matchesCategory = product.category?.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
        }

        if (inStockOnly && product.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.salePrice ?? a.price;
        const priceB = b.salePrice ?? b.price;

        if (sortBy === 'price-asc') return priceA - priceB;
        if (sortBy === 'price-desc') return priceB - priceA;
        if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [categories, products, selectedCategory, searchQuery, sortBy, inStockOnly]);

  const resetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortBy('featured');
    setInStockOnly(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'all' || searchQuery.trim() !== '' || inStockOnly || sortBy !== 'featured';

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {selectedCategory === 'all'
              ? 'All Handcrafted Collections'
              : categories.find((c) => c.slug === selectedCategory)?.name || 'Collections'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Showing {filteredProducts.length} authentic Ghanaian products
          </p>
        </div>

        {/* Controls: Search, Sort & Mobile Filter Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex-1 sm:w-60">
            <input
              type="text"
              placeholder="Filter catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs py-2 pl-8 pr-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs py-2 px-3 rounded-xl border border-slate-300 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="featured">Featured First</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="lg:hidden p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl flex items-center gap-1.5 text-xs font-semibold min-h-tap"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Layout: Desktop Sidebar Filters + Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 pr-4 border-r border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Filters</h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs text-primary-700 hover:underline flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Category List */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 mb-2">Category</h3>
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                  selectedCategory === 'all'
                    ? 'bg-primary-50 text-primary-800 font-bold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>All Categories</span>
                <span className="text-[10px] text-slate-600">{products.length}</span>
              </button>
              {categories.map((c) => {
                const count = products.filter(
                  (p) =>
                    p.categoryId === c.id ||
                    p.category?.toLowerCase() === c.name.toLowerCase() ||
                    p.category?.toLowerCase() === c.slug.toLowerCase()
                ).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCategory(c.slug)}
                    className={`w-full text-left text-xs py-1.5 px-2.5 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === c.slug
                        ? 'bg-primary-50 text-primary-800 font-bold'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="line-clamp-1">{c.name}</span>
                    <span className="text-[10px] text-slate-600">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stock Availability */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Availability</h3>
            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <section className="lg:col-span-3">
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs text-slate-600">Active filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-primary-100 text-primary-800 px-2.5 py-0.5 rounded-full font-medium">
                  {categories.find((c) => c.slug === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-primary-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-slate-200 text-slate-800 px-2.5 py-0.5 rounded-full font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-black">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full font-medium">
                  In Stock Only
                  <button onClick={() => setInStockOnly(false)} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full mx-auto flex items-center justify-center">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No matching items found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching for other authentic Ghanaian treasures like "Kente", "Shea", or "Shito".
              </p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Mobile Filters Drawer Modal */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
            onClick={() => setIsFilterDrawerOpen(false)}
          />
          <div className="relative w-full max-w-xs bg-white h-full shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="font-bold text-sm text-slate-900">Filter Products</h3>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 rounded-lg min-w-tap min-h-tap flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Category</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setIsFilterDrawerOpen(false);
                    }}
                    className={`w-full text-left text-xs py-2 px-3 rounded-lg ${
                      selectedCategory === 'all'
                        ? 'bg-primary-100 text-primary-900 font-bold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCategory(c.slug);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`w-full text-left text-xs py-2 px-3 rounded-lg ${
                        selectedCategory === c.slug
                          ? 'bg-primary-100 text-primary-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2">Stock Availability</h4>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span>In Stock Only</span>
                </label>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={() => {
                  resetFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-200"
              >
                Reset
              </button>
              <button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="flex-1 py-2.5 bg-primary-700 text-white rounded-xl text-xs font-bold hover:bg-primary-800"
              >
                Show Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 text-center">
          <div className="w-10 h-10 border-4 border-primary-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading catalog...</p>
        </div>
      }
    >
      <ShopContent />
    </Suspense>
  );
}
