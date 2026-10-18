import React from 'react';
import { RotateCcw, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ReturnsPolicyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-6">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <RotateCcw className="w-6 h-6 text-primary-700" />
          <span>Returns & Refunds Policy</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Our 7-day fair satisfaction guarantee for Ghanaian customers
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed shadow-sm">
        <div className="space-y-2">
          <h2 className="font-bold text-base text-slate-900">7-Day Return Window</h2>
          <p>
            If you are not completely satisfied with your purchase, you may initiate a return or exchange within 7 calendar days of receipt.
          </p>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-base text-slate-900">Eligible Items</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Unworn, unwashed Kente cloth, apparel, and fabric pieces with original tags intact.</li>
            <li>Bolga baskets in original, undamaged condition.</li>
            <li>Unopened skincare jars (Shea butter, black soap) with intact foil/protective seals.</li>
          </ul>
        </div>

        <div className="space-y-2">
          <h2 className="font-bold text-base text-slate-900">Mobile Money & Card Refunds</h2>
          <p>
            Once our Accra fulfillment team verifies the returned item, your refund will be processed back to the original payment source:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>MTN MoMo / Telecel Cash / AT Money:</strong> Credited within 24 - 48 hours.</li>
            <li><strong>Debit / Credit Cards:</strong> 3 - 5 business days depending on your bank.</li>
          </ul>
        </div>

        <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-xs flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-700 shrink-0" />
          <span>
            Need help initiating a return? Contact our support line directly via WhatsApp at <strong>+233 (0) 24 412 3456</strong> or email <strong>orders@mamathesstore.com</strong>.
          </span>
        </div>
      </div>
    </div>
  );
}
