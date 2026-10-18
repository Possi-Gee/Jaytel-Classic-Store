import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Sparkles, Heart, Crown, Globe, ShieldCheck } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto py-6">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-pink-100 text-pink-700 text-xs font-black">
          <Crown className="w-4 h-4 text-pink-500" />
          <span>Fabulous Glamour & Feminine Luxury</span>
          <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          About Jaytel Classic Store
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Celebrating self-expression, confidence, and girlish chic through iconic designer mini bags, dreamy dresses, and viral beauty treats.
        </p>
      </div>

      <div className="relative aspect-[21/9] rounded-4xl overflow-hidden shadow-pink-lg border border-pink-200">
        <Image
          src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1200&q=80"
          alt="Jaytel Classic Luxury Handbags and Fashion"
          fill
          className="object-cover"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs sm:text-sm text-slate-700 leading-relaxed">
        <div className="space-y-4 bg-white p-6 sm:p-8 rounded-4xl border border-pink-100 shadow-soft">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>Our Girlish Story</span>
          </h2>
          <p>
            Jaytel Classic Store was born from a passion for chic elegance, playful luxury, and all things pretty. We wanted to create a dream destination for women and girls in Ghana who love high-fashion aesthetics without compromise.
          </p>
          <p>
            Every collection is hand-curated to bring you runway-inspired mini bags, radiant glossy beauty, and effortless brunch styles that make you feel like royalty every single day.
          </p>
        </div>

        <div className="space-y-4 bg-white p-6 sm:p-8 rounded-4xl border border-pink-100 shadow-soft">
          <h2 className="text-base font-black text-slate-900 flex items-center gap-2">
            <Crown className="w-4 h-4 text-pink-500" />
            <span>Fast Ghana Delivery & MoMo Simplicity</span>
          </h2>
          <p>
            We take pride in offering seamless local shopping. From Accra and Tema to Kumasi and beyond, your favorite glam essentials arrive quickly with real-time tracking and instant Mobile Money (MTN MoMo, Telecel Cash, AT Money) authorization.
          </p>
          <p>
            Every order is carefully packaged with signature Jaytel Classic love, wrapping, and attention to detail.
          </p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white rounded-4xl p-8 sm:p-10 text-center space-y-4 shadow-pink-lg">
        <h3 className="text-xl sm:text-2xl font-black">Step into the Jaytel Classic World</h3>
        <p className="text-xs text-pink-100 max-w-md mx-auto">
          Explore our newest glam arrivals today and discover your next signature piece.
        </p>
        <Link
          href="/shop"
          className="inline-block px-7 py-3.5 bg-white text-pink-600 font-black text-xs rounded-full shadow-lg hover:bg-pink-50 transition-colors"
        >
          Explore Collections ♥
        </Link>
      </div>
    </div>
  );
}
