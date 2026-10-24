'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, X, Copy, Check, Phone } from 'lucide-react';

interface AnnouncementBarProps {
  repeatIntervalMs?: number; // Default 5 minutes (300,000ms)
  durationMs?: number;       // Default 10 seconds (10,000ms)
}

export default function AnnouncementBar({
  repeatIntervalMs = 5 * 60 * 1000, // 5 minutes
  durationMs = 10 * 1000,          // 10 seconds
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [announcementText, setAnnouncementText] = useState(
    'Jaytel Classic Store • Home of Quality and Affordable • Call / WhatsApp: 0243484468 / 0507080720 • Code'
  );
  const [announcementCode, setAnnouncementCode] = useState('PINKGLAM');

  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch dynamic announcement settings if available
  useEffect(() => {
    let isMounted = true;
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.settings && isMounted) {
            if (data.settings.announcementText) {
              setAnnouncementText(data.settings.announcementText);
            }
            if (data.settings.announcementCode) {
              setAnnouncementCode(data.settings.announcementCode);
            }
          }
        }
      } catch {
        // Fallback to defaults
      }
    }
    fetchSettings();
    return () => {
      isMounted = false;
    };
  }, []);

  const slideDownAndAutoHide = useCallback(() => {
    // Clear any pending hide timer
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    // Slide down
    setIsVisible(true);

    // Stay for specified duration (10 seconds), then slide up and leave
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, durationMs);
  }, [durationMs]);

  // Handle manual removal / dismissal by user
  const handleDismiss = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
    setIsVisible(false);
  };

  // Schedule initial slide-down and subsequent 5-minute intervals
  useEffect(() => {
    // 1. Initial slide down on load (stays 10s, then leaves)
    const initialTimer = setTimeout(() => {
      slideDownAndAutoHide();
    }, 800);

    // 2. Repeat slide down every 5 minutes (300,000ms)
    intervalRef.current = setInterval(() => {
      slideDownAndAutoHide();
    }, repeatIntervalMs);

    return () => {
      clearTimeout(initialTimer);
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [slideDownAndAutoHide, repeatIntervalMs]);

  // Copy promo code helper
  const handleCopyCode = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(announcementCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Ignore clipboard write errors
    }
  };

  return (
    <aside
      role="banner"
      aria-label="Announcement"
      aria-hidden={!isVisible}
      className={`relative z-50 w-full overflow-hidden transition-all duration-700 ease-in-out ${
        isVisible
          ? 'max-h-24 opacity-100 translate-y-0 shadow-md'
          : 'max-h-0 opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="bg-gradient-to-r from-pink-600 via-rose-500 to-pink-600 text-white text-[11px] sm:text-xs py-2 px-3 sm:px-6 relative">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          {/* Left spacer for centering balance on desktop */}
          <div className="w-6 hidden md:block shrink-0" />

          {/* Main Content */}
          <div className="flex-1 flex items-center justify-center text-center flex-wrap gap-1.5 sm:gap-2 font-bold tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse shrink-0" />

            <span className="leading-snug">{announcementText}</span>

            {/* Click-to-copy Promo Code badge */}
            <button
              type="button"
              onClick={handleCopyCode}
              title="Click to copy promo code"
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 hover:bg-white/30 text-white font-black tracking-wider transition-all duration-150 transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs border border-white/20"
            >
              <span className="underline decoration-pink-200 underline-offset-2">{announcementCode}</span>
              {copied ? (
                <span className="flex items-center text-[10px] text-pink-100 font-extrabold bg-pink-700/60 px-1 rounded">
                  <Check className="w-3 h-3 mr-0.5" /> Copied!
                </span>
              ) : (
                <Copy className="w-2.5 h-2.5 opacity-80" />
              )}
            </button>

            <Sparkles className="w-3.5 h-3.5 text-pink-200 animate-pulse shrink-0 hidden sm:inline" />
          </div>

          {/* Right: Manual Close / Remove button */}
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Remove announcement banner"
            title="Close this banner (Slides down again in 5 minutes)"
            className="p-1 sm:p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/25 active:bg-white/30 transition-all shrink-0 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>

        {/* 10-Second Countdown Indicator Bar */}
        {isVisible && (
          <div
            className="absolute bottom-0 left-0 h-[2px] bg-white/40 shadow-xs"
            style={{
              animation: `announcementCountdown ${durationMs}ms linear forwards`,
            }}
          />
        )}
      </div>

      {/* Countdown animation keyframe */}
      <style>{`
        @keyframes announcementCountdown {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </aside>
  );
}
