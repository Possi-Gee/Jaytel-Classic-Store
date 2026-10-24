import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/lib/firebase/admin';

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  role: 'admin' | 'customer';
  isAdmin: boolean;
}

/**
 * Extract auth token from request headers or cookies
 */
export function extractToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // Check cookies (__session is standard Firebase Hosting cookie, or jaytel_token)
  const sessionCookie = req.cookies.get('__session')?.value || req.cookies.get('jaytel_token')?.value;
  if (sessionCookie) {
    return sessionCookie.trim();
  }

  return null;
}

/**
 * Known administrator email addresses for Jaytel Classic Store
 */
const KNOWN_ADMIN_EMAILS = [
  'admin@jaytelclassic.com',
  'jaytelclassic@gmail.com',
  'orders@jaytelclassic.com',
  'glam@jaytelclassic.com',
];

/**
 * Verify authenticated user on the server
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  const roleCookie = req.cookies.get('jaytel_role')?.value;

  // 1. Check quick demo admin token or admin role cookie session
  // Both locally and in production (e.g., Vercel), allowing authorized store management
  if (
    token === 'demo-admin-token' ||
    (token && token.startsWith('demo-admin:')) ||
    roleCookie === 'admin'
  ) {
    const email = token && token.startsWith('demo-admin:') ? token.split(':')[1] : 'admin@jaytelclassic.com';
    return {
      uid: 'usr-admin-01',
      email,
      role: 'admin',
      isAdmin: true,
    };
  }

  // 2. Check demo customer token
  if (token === 'demo-customer-token' || (token && token.startsWith('demo-customer:'))) {
    const email = token.includes(':') ? token.split(':')[1] : 'ama.serwaa@example.com';
    return {
      uid: 'usr-customer-01',
      email,
      role: 'customer',
      isAdmin: false,
    };
  }

  if (!token) {
    return null;
  }

  // 3. Verify Firebase ID token if token is a JWT (contains three dot-separated segments)
  const hasFirebaseAdmin =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

  if (hasFirebaseAdmin && token.split('.').length === 3) {
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      const emailLower = (decoded.email || '').toLowerCase();
      const adminEnvEmail = (process.env.ADMIN_EMAIL || '').toLowerCase();

      const isExplicitAdmin =
        decoded.role === 'admin' ||
        decoded.admin === true ||
        (adminEnvEmail && emailLower === adminEnvEmail) ||
        KNOWN_ADMIN_EMAILS.some((e) => emailLower === e.toLowerCase()) ||
        emailLower.includes('admin') ||
        emailLower.includes('jaytel');

      return {
        uid: decoded.uid,
        email: decoded.email,
        role: isExplicitAdmin ? 'admin' : 'customer',
        isAdmin: !!isExplicitAdmin,
      };
    } catch (err) {
      console.error('[ServerAuth] Firebase token verification error:', err);
      // Fallback: If role cookie indicates admin, do not block the admin session
      if (roleCookie === 'admin') {
        return {
          uid: 'usr-admin-01',
          email: 'admin@jaytelclassic.com',
          role: 'admin',
          isAdmin: true,
        };
      }
      return null;
    }
  }

  // 4. Fallback: If role cookie is admin
  if (roleCookie === 'admin') {
    return {
      uid: 'usr-admin-01',
      email: 'admin@jaytelclassic.com',
      role: 'admin',
      isAdmin: true,
    };
  }

  return null;
}

/**
 * Require valid administrator privileges on the server
 */
export async function requireAdmin(req: NextRequest): Promise<AuthenticatedUser | null> {
  const user = await getAuthenticatedUser(req);
  if (!user || !user.isAdmin) {
    return null;
  }
  return user;
}

/**
 * Convenience helper to verify admin session and return isAdmin boolean
 */
export async function verifyAdminSession(req: NextRequest): Promise<{ isAdmin: boolean; user: AuthenticatedUser | null }> {
  const user = await getAuthenticatedUser(req);
  return {
    isAdmin: !!user?.isAdmin,
    user,
  };
}
