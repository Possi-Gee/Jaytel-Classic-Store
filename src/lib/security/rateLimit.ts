import { NextRequest, NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitStore>();

// Clean up expired entries every 5 minutes to prevent memory leaks
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    rateLimitMap.forEach((val, key) => {
      if (now > val.resetTime) {
        rateLimitMap.delete(key);
      }
    });
  }, 5 * 60 * 1000);
}

export interface RateLimitOptions {
  limit?: number; // Maximum requests allowed within window
  windowSeconds?: number; // Time window in seconds
}

/**
 * Apply rate limiting to a Next.js API route request
 * Returns NextResponse (429) if limit exceeded, or null if allowed
 */
export function checkRateLimit(
  req: NextRequest,
  options: RateLimitOptions = {}
): NextResponse | null {
  const limit = options.limit ?? 30;
  const windowSeconds = options.windowSeconds ?? 60;

  // Extract client identifier (IP or fallback identifier)
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : '127.0.0.1';
  const pathname = req.nextUrl.pathname;
  const key = `${ip}:${pathname}`;

  const now = Date.now();
  const existing = rateLimitMap.get(key);

  if (!existing || now > existing.resetTime) {
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + windowSeconds * 1000,
    });
    return null;
  }

  if (existing.count >= limit) {
    const retryAfter = Math.ceil((existing.resetTime - now) / 1000);
    return NextResponse.json(
      {
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
        },
      }
    );
  }

  existing.count++;
  return null;
}
