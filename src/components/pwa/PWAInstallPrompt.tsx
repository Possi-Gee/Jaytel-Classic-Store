'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Download, X, Heart, Sparkles } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isInStandaloneMode =
      ('standalone' in (window.navigator as any)) && (window.navigator as any).standalone;

    if (isIosDevice && !isInStandaloneMode) {
      setIsIOS(true);
      const dismissed = localStorage.getItem('jaytel_ios_install_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3500);
        return () => clearTimeout(timer);
      }
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('jaytel_pwa_dismissed');
      if (!dismissed) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowPrompt(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    if (isIOS) {
      localStorage.setItem('jaytel_ios_install_dismissed', 'true');
    } else {
      localStorage.setItem('jaytel_pwa_dismissed', 'true');
    }
  };

  if (!showPrompt) return null;

  return (
    <>
      <aside
        aria-label="App installation banner"
        className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-sm z-50 bg-slate-950 text-white p-3.5 rounded-3xl shadow-pink-lg border border-pink-500/40 flex items-center justify-between gap-3 animate-slideUp"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white border-2 border-pink-400 shrink-0 shadow-sm">
            <Image src="/logo.png" alt="Jaytel Classic App" fill className="object-cover" />
          </div>
          <div>
            <h4 className="text-xs font-black leading-tight flex items-center gap-1">
              <span>Install Jaytel App</span>
              <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            </h4>
            <p className="text-[11px] text-pink-200">Instant mobile glam shopping & MoMo checkout</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleInstallClick}
            className="px-3.5 py-1.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-black text-xs rounded-xl flex items-center gap-1 shadow-pink transition-all min-h-tap"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install</span>
          </button>
          <button
            onClick={handleDismiss}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg min-w-tap min-h-tap flex items-center justify-center"
            aria-label="Dismiss install prompt"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* iOS Modal Guide */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white text-slate-900 rounded-4xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl border border-pink-200">
            <div className="relative w-14 h-14 rounded-2xl overflow-hidden mx-auto bg-white border border-pink-300 shadow-pink">
              <Image src="/logo.png" alt="Jaytel Classic Logo" fill className="object-cover" />
            </div>
            <h3 className="text-base font-black text-slate-900">Install Jaytel on your iPhone</h3>
            <div className="text-xs text-slate-600 space-y-3 text-left bg-pink-50/50 p-4 rounded-2xl border border-pink-100">
              <p className="flex items-center gap-2">
                <span className="font-bold text-pink-600">1.</span> Tap the <strong>Share</strong> button at the bottom of Safari.
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-pink-600">2.</span> Scroll down and tap <strong>Add to Home Screen</strong>.
              </p>
              <p className="flex items-center gap-2">
                <span className="font-bold text-pink-600">3.</span> Tap <strong>Add</strong> in the top right corner.
              </p>
            </div>
            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl text-xs font-bold hover:opacity-95 transition-opacity"
            >
              Got it ♥
            </button>
          </div>
        </div>
      )}
    </>
  );
}
