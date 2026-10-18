import React from 'react';

export default function TermsPage() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto py-6">
      <h1 className="text-2xl font-extrabold text-slate-900 border-b border-slate-200 pb-3">
        Terms of Service
      </h1>
      <div className="space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="font-bold text-slate-900">1. Acceptance of Terms</h2>
        <p>
          By accessing and placing orders through Mama Thes Store (online or mobile progressive web app), you agree to be bound by these Terms of Service governed by the laws of the Republic of Ghana.
        </p>

        <h2 className="font-bold text-slate-900">2. Pricing and Currency</h2>
        <p>
          All prices are quoted in Ghana Cedis (GH₵). We reserve the right to correct any typographical pricing errors prior to order fulfillment.
        </p>

        <h2 className="font-bold text-slate-900">3. Ghanaian Payment Processing</h2>
        <p>
          Payments made via Mobile Money (MTN MoMo, Telecel Cash, AT Money) or Bank Cards are processed via licensed and secure payment service providers. You must be the authorized holder of the payment account used.
        </p>

        <h2 className="font-bold text-slate-900">4. Delivery</h2>
        <p>
          Delivery times are estimates and may vary due to traffic, weather, or courier schedules. The customer is responsible for providing accurate delivery instructions, phone numbers, and landmarks.
        </p>
      </div>
    </div>
  );
}
