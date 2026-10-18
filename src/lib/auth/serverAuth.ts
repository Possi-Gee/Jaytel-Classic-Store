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
 * Verify authenticated user on the server
 */
export async function getAuthenticatedUser(req: NextRequest): Promise<AuthenticatedUser | null> {
  const token = extractToken(req);
  if (!token) {
    return null;
  }

  // Check if Firebase Admin is configured with real credentials
  const hasFirebaseAdmin =
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY;

  if (hasFirebaseAdmin) {
    try {
      const decoded = await getAdminAuth().verifyIdToken(token);
      const isExplicitAdmin =
        decoded.role === 'admin' ||
        decoded.admin === true ||
        (decoded.email && decoded.email === process.env.ADMIN_EMAIL);

      return {
        uid: decoded.uid,
        email: decoded.email,
        role: isExplicitAdmin ? 'admin' : 'customer',
        isAdmin: !!isExplicitAdmin,
      };
    } catch (err) {
      console.error('[ServerAuth] Firebase token verification failed:', err);
      return null;
    }
  }

  // In production, never accept demo tokens
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  // Development/Demo fallback tokens
  if (token === 'demo-admin-token' || token.startsWith('demo-admin:')) {
    return {
      uid: 'usr-admin-01',
      email: 'admin@jaytelclassic.com',
      role: 'admin',
      isAdmin: true,
    };
  }

  if (token === 'demo-customer-token' || token.startsWith('demo-customer:')) {
    const email = token.includes(':') ? token.split(':')[1] : 'ama.serwaa@example.com';
    return {
      uid: 'usr-customer-01',
      email,
      role: 'customer',
      isAdmin: false,
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
