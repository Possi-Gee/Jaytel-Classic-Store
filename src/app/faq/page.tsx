import React from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How do I pay with MTN Mobile Money or Telecel Cash?',
    a: 'At checkout, select "Mobile Money", choose your telecom provider (MTN, Telecel, or AirtelTigo), and enter your phone number. You will receive an immediate USSD authorization prompt on your phone asking you to enter your MoMo PIN to authorize the transaction.',
  },
  {
    q: 'How fast is delivery within Accra and Tema?',
    a: 'Orders confirmed before 2:00 PM GMT on business days qualify for same-day delivery. All other Accra/Tema deliveries arrive within 24 hours.',
  },
  {
    q: 'Do you deliver outside Accra to Kumasi, Takoradi, or Tamale?',
    a: 'Yes! We deliver across all 16 regions of Ghana. Deliveries to Kumasi and other regional capitals take 1 - 3 business days via our courier network.',
  },
  {
    q: 'Are your Bonwire Kente cloths genuine?',
    a: 'Yes, 100%. We source our Kente directly from generational master weavers in Bonwire, Ashanti Region. We do not sell cheap synthetic printed imitations.',
  },
  {
    q: 'Can I install Mama Thes Store as an app on my phone?',
    a: 'Yes! When browsing on Android or iPhone, tap the "Install" button or tap "Share > Add to Home Screen" on Safari to install Mama Thes Store directly to your phone screen for an instant app experience.',
  },
];

export default function FAQPage() {
  return (
    <div className="space-y-8 max-w-3xl mx-auto py-6">
      <div className="border-b border-slate-200 pb-4 text-center">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
          <HelpCircle className="w-6 h-6 text-primary-700" />
          <span>Frequently Asked Questions</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about shopping, payments, and delivery at Mama Thes Store
        </p>
      </div>

      <div className="space-y-4">
        {FAQS.map((faq, idx) => (
          <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2">
            <h2 className="font-bold text-sm text-slate-900">{faq.q}</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
