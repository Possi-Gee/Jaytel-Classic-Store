import React from 'react';
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="py-20 text-center max-w-md mx-auto space-y-4">
      <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
        <ShoppingBag className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Page Not Found</h1>
      <p className="text-xs text-slate-600 leading-relaxed">
        The item or page you are looking for may have been moved or is currently unavailable.
      </p>
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary-700 text-white rounded-xl text-xs font-bold hover:bg-primary-800 transition-colors"
        >
          <span>Return Home</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
