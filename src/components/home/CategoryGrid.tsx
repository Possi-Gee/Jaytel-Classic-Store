'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCategory } from '@/types';
import { mockCategories } from '@/data/mockData';

interface CategoryGridProps {
  initialCategories?: ProductCategory[];
}

export default function CategoryGrid({
  initialCategories = mockCategories,
}: CategoryGridProps) {
  const [categories, setCategories] = useState<ProductCategory[]>(initialCategories);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch('/api/categories');
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.categories) && data.categories.length > 0) {
            setCategories(data.categories);
          }
        }
      } catch (err) {
        console.warn('Failed to load dynamic categories:', err);
      }
    }
    loadCategories();
  }, []);

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
            Explore All Collections
          </h2>
          <Sparkles className="w-4 h-4 text-pink-500 animate-pulse" />
        </div>
        <Link
          href="/shop"
          className="text-xs sm:text-sm font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 group"
        >
          <span>View All in Store</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/shop?category=${cat.slug}`}
            className="group relative rounded-3xl overflow-hidden bg-white border border-pink-100 shadow-soft hover:shadow-pink transition-all flex flex-col hover:-translate-y-1 duration-300"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-pink-50">
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'}
                alt={cat.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-2.5 left-3 right-3 text-left">
                <span className="text-xs sm:text-sm font-bold text-white line-clamp-1 drop-shadow-sm group-hover:text-pink-200 transition-colors">
                  {cat.name}
                </span>
                {cat.productCount !== undefined && (
                  <span className="text-[10px] text-pink-200/80 block -mt-0.5 font-medium">
                    {cat.productCount > 0 ? `${cat.productCount} items` : 'Browse collection'}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
