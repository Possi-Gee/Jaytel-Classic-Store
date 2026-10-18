'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ShoppingBag, Heart, Package, User } from 'lucide-react';
import { useWishlist } from '@/context/WishlistContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { wishlistIds } = useWishlist();

  const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Shop', href: '/shop', icon: ShoppingBag },
    {
      label: 'Wishlist',
      href: '/wishlist',
      icon: Heart,
      badge: wishlistIds.length > 0 ? wishlistIds.length : null,
    },
    { label: 'Orders', href: '/orders', icon: Package },
    { label: 'Account', href: '/account', icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-pink-100 shadow-nav safe-bottom transition-all"
      aria-label="Mobile Bottom Navigation"
    >
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-tap py-1 transition-all ${
                isActive
                  ? 'text-pink-600 font-bold'
                  : 'text-slate-400 hover:text-pink-500 font-medium'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.5] text-pink-600' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-pink-500 text-white font-black text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[11px] mt-1 leading-none tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1.5 h-1.5 bg-pink-600 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
