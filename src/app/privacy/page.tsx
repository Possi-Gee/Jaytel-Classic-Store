import React from 'react';

export default function PrivacyPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">
        Privacy & Data Protection Policy
      </h1>
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="font-bold text-slate-900">1. Information We Collect</h2>
        <p>
          We collect your name, phone number, email address, delivery location, and order history strictly for the purpose of order fulfillment, payment verification, and customer service.
        </p>

        <h2 className="font-bold text-slate-900">2. Security of Payment Information</h2>
        <p>
          Mama Thes Store never stores your Mobile Money PIN or credit card CVV. All payment transactions are handled through tokenized, PCI-DSS compliant payment gateways.
        </p>

        <h2 className="font-bold text-slate-900">3. Compliance with Ghana Data Protection Act</h2>
        <p>
          We adhere to the Data Protection Act, 2012 (Act 843) of Ghana. Your personal details will never be sold, rented, or disclosed to unauthorized third parties.
        </p>
      </div>
    </div>
  );
}
