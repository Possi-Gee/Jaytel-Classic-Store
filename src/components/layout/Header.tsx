'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, Heart, User, Search, ShieldAlert, X, Menu, Sparkles } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistIds } = useWishlist();
  const { user, isAdmin, switchDemoRole } = useAuth();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
    async function loadCats() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.categories)) {
            setCategories(data.categories);
          }
        }
      } catch (e) {
        // silently fallback
      }
    }
    loadCats();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Dev / Admin Bar if logged in as Admin */}
      {isAdmin && (
        <div className="bg-pink-600 text-white px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="w-4 h-4 text-pink-200" />
            <span>Jaytel Store Admin Mode Active</span>
          </div>
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="underline hover:text-pink-100 font-bold">
              Open Admin Dashboard &rarr;
            </Link>
            <button
              onClick={() => switchDemoRole('customer')}
              className="text-[11px] bg-slate-900 text-white px-2 py-0.5 rounded-full hover:bg-slate-800"
            >
              Switch to Customer
            </button>
          </div>
        </div>
      )}

      {/* Top Girlish Announcement Bar */}
      <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-500 text-white text-[11px] sm:text-xs py-1.5 px-4 text-center font-bold tracking-wide shadow-xs flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
        <span>Jaytel Classic Store • Home of Quality and Affordable • Call / WhatsApp: 0243484468 / 0507080720 • Code </span>
        <span className="underline decoration-pink-200 font-black">PINKGLAM</span>
        <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse" />
      </div>

      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-pink-100 shadow-soft transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-3">
            {/* Left: Mobile Menu Toggle & Brand Logo with Image */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 -ml-2 rounded-xl text-slate-700 hover:text-pink-600 hover:bg-pink-50 lg:hidden min-w-tap min-h-tap flex items-center justify-center"
                aria-label="Toggle navigation menu"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6 text-pink-600" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group">
                <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden shadow-pink group-hover:scale-105 transition-transform bg-white border-2 border-pink-300 shrink-0">
                  <Image
                    src="/logo.png"
                    alt="Jaytel Classic Store Logo"
                    fill
                    sizes="52px"
                    priority
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-black text-base sm:text-xl tracking-tight text-slate-900 group-hover:text-pink-600 transition-colors">
                      Jaytel <span className="text-pink-600 font-extrabold">Classic</span>
                    </span>
                    <span className="text-pink-500 text-xs">♥</span>
                  </div>
                  <span className="text-[10px] text-pink-600 font-bold tracking-wider uppercase -mt-0.5">
                    Store • Quality & Affordable
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search African prints, lace, dresses, shoes, cookware..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-pink-200 bg-pink-50/50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-inner"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
              </form>
            </div>

            {/* Middle Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-5 text-xs sm:text-sm font-bold text-slate-700">
              <Link
                href="/shop"
                className={`hover:text-pink-600 transition-colors ${
                  pathname === '/shop' ? 'text-pink-600' : ''
                }`}
              >
                Shop All
              </Link>
              <Link
                href="/shop?category=african-prints"
                className="hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                African Prints
              </Link>
              <Link
                href="/shop?category=lace-fabrics"
                className="hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                Lace / Fabrics
              </Link>
              <Link
                href="/shop?category=ladies-wear"
                className="hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                Ladies Wear
              </Link>
              <Link
                href="/shop?category=shoes-bags"
                className="hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                Shoes / Bags
              </Link>
              <Link
                href="/shop?category=kitchen-ware"
                className="hover:text-pink-600 transition-colors whitespace-nowrap"
              >
                Kitchen
              </Link>
              <Link
                href="/orders"
                className={`hover:text-pink-600 transition-colors whitespace-nowrap ${
                  pathname === '/orders' ? 'text-pink-600' : ''
                }`}
              >
                Track Order
              </Link>
            </nav>

            {/* Right: Actions */}
            <div className="flex items-center space-x-1 sm:space-x-2.5">
              {/* Mobile search toggle */}
              <button
                type="button"
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="lg:hidden p-2 text-slate-700 hover:text-pink-600 rounded-full hover:bg-pink-50 min-w-tap min-h-tap flex items-center justify-center"
                aria-label="Open search input"
              >
                <Search className="w-5 h-5 text-pink-600" />
              </button>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative p-2 text-slate-700 hover:text-pink-600 rounded-full hover:bg-pink-50 hidden sm:flex items-center justify-center min-w-tap min-h-tap"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 text-pink-500 fill-pink-50 hover:fill-pink-500 transition-colors" />
                {wishlistIds.length > 0 && (
                  <span className="absolute top-1 right-1 bg-pink-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {wishlistIds.length}
                  </span>
                )}
              </Link>

              {/* Account Link */}
              <Link
                href="/account"
                className="p-2 text-slate-700 hover:text-pink-600 rounded-full hover:bg-pink-50 hidden sm:flex items-center justify-center min-w-tap min-h-tap"
                aria-label="Customer Account"
              >
                <User className="w-5 h-5" />
              </Link>

              {/* Shopping Cart Button */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative p-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full shadow-pink transition-transform active:scale-95 flex items-center justify-center min-w-tap min-h-tap"
                aria-label={`Open shopping cart with ${cartCount} items`}
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-slate-900 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Expandable Mobile Search Bar */}
          {isSearchOpen && (
            <div className="lg:hidden py-3 border-t border-pink-100 animate-fadeIn">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search African prints, lace, bags, cookware..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full pl-10 pr-10 py-2.5 rounded-full border border-pink-200 bg-pink-50/50 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500 focus:bg-white"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
                <button
                  type="button"
                  onClick={() => setIsSearchOpen(false)}
                  className="absolute right-3 top-2.5 p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Mobile Navigation Drawer / Menu with Dynamic Categories */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-pink-100 bg-white px-5 py-4 space-y-3 shadow-pink-lg max-h-[80vh] overflow-y-auto">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-extrabold text-pink-600 border-b border-pink-50"
            >
              Browse All Collections &rarr;
            </Link>

            <div className="space-y-1.5 text-xs font-semibold text-slate-700 pt-1">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/shop?category=${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 rounded-xl hover:bg-pink-50 hover:text-pink-600 transition-colors"
                  >
                    ✦ {cat.name}
                  </Link>
                ))
              ) : (
                <>
                  <Link
                    href="/shop?category=african-prints"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    ✨ African Prints
                  </Link>
                  <Link
                    href="/shop?category=lace-fabrics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    👑 Lace / Fabrics
                  </Link>
                  <Link
                    href="/shop?category=ladies-wear"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    👗 Ladies Wear
                  </Link>
                  <Link
                    href="/shop?category=men-kids-wear"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    👔 Men & Kids Wear
                  </Link>
                  <Link
                    href="/shop?category=shoes-bags"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    👜 Shoes / Bags
                  </Link>
                  <Link
                    href="/shop?category=kitchen-ware"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    🍳 Kitchen Ware
                  </Link>
                  <Link
                    href="/shop?category=cosmetics"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-1.5 px-2 hover:bg-pink-50 hover:text-pink-600"
                  >
                    💄 Cosmetics
                  </Link>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-pink-100 flex flex-col gap-2 text-xs font-medium text-slate-600">
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-pink-600"
              >
                Track Orders
              </Link>
              <div className="py-2 text-[11px] text-pink-700 bg-pink-50 p-2.5 rounded-xl">
                <p className="font-bold">Contact / WhatsApp:</p>
                <p>0243484468 / 0507080720</p>
                <p className="text-[10px] text-slate-500 mt-0.5">@jaytel_classic_store</p>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
