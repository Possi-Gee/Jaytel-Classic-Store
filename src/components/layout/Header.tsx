'use client';

import React, { useState } from 'react';
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
        <span>Welcome to Jaytel Classic Store • Free Gift with orders above GH₵ 300 with code </span>
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
                <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-2xl overflow-hidden shadow-pink group-hover:scale-105 transition-transform bg-white border border-pink-200 shrink-0">
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
                    Store • Girlish Glamour
                  </span>
                </div>
              </Link>
            </div>

            {/* Middle: Desktop Search Bar */}
            <div className="hidden lg:flex flex-1 max-w-md mx-6">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <input
                  type="text"
                  placeholder="Search mini bags, chic dresses, lip oils, heels..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-pink-200 bg-pink-50/50 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-pink-300 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all shadow-inner"
                />
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-pink-400" />
              </form>
            </div>

            {/* Middle Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center space-x-6 text-xs sm:text-sm font-bold text-slate-700">
              <Link
                href="/shop"
                className={`hover:text-pink-600 transition-colors ${
                  pathname === '/shop' ? 'text-pink-600' : ''
                }`}
              >
                Shop All
              </Link>
              <Link
                href="/shop?category=luxe-handbags-mini-bags"
                className="hover:text-pink-600 transition-colors"
              >
                Luxe Bags
              </Link>
              <Link
                href="/shop?category=chic-dresses-glam-sets"
                className="hover:text-pink-600 transition-colors"
              >
                Chic Dresses
              </Link>
              <Link
                href="/shop?category=glossy-lip-kits-makeup"
                className="hover:text-pink-600 transition-colors"
              >
                Beauty & Lips
              </Link>
              <Link
                href="/orders"
                className={`hover:text-pink-600 transition-colors ${
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
                  placeholder="Search Jaytel bags, dresses, makeup..."
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

        {/* Mobile Navigation Drawer / Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-pink-100 bg-white px-5 py-4 space-y-3 shadow-pink-lg">
            <Link
              href="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-sm font-extrabold text-pink-600 border-b border-pink-50"
            >
              Browse All Girlish Glamour &rarr;
            </Link>
            <div className="space-y-2 text-xs font-semibold text-slate-700 pt-1">
              <Link
                href="/shop?category=luxe-handbags-mini-bags"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 hover:text-pink-600"
              >
                👜 Luxe Handbags & Mini Bags
              </Link>
              <Link
                href="/shop?category=chic-dresses-glam-sets"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 hover:text-pink-600"
              >
                👗 Chic Dresses & Sets
              </Link>
              <Link
                href="/shop?category=glossy-lip-kits-makeup"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 hover:text-pink-600"
              >
                💄 Glossy Lip Kits & Makeup
              </Link>
              <Link
                href="/shop?category=dainty-jewelry-sparkling-jewels"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 hover:text-pink-600"
              >
                💍 Dainty Jewelry & Charms
              </Link>
            </div>
            <div className="pt-3 border-t border-pink-100 flex flex-col gap-2 text-xs font-medium text-slate-600">
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-pink-600"
              >
                Track Orders
              </Link>
              <Link
                href="/about"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-pink-600"
              >
                About Jaytel Classic Store
              </Link>
              <Link
                href="/contact"
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-1 hover:text-pink-600"
              >
                Customer Support & WhatsApp
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
