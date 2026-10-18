import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect administrator web page (/admin)
  if (pathname.startsWith('/admin')) {
    const sessionToken =
      request.cookies.get('__session')?.value ||
      request.cookies.get('jaytel_token')?.value;

    const role = request.cookies.get('jaytel_role')?.value;

    // In production, strictly require valid session cookie
    if (!sessionToken || (role && role !== 'admin')) {
      const loginUrl = new URL('/account', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('alert', 'admin_access_required');
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect administrator API endpoints (/api/admin)
  if (pathname.startsWith('/api/admin')) {
    const sessionToken =
      request.headers.get('authorization') ||
      request.cookies.get('__session')?.value ||
      request.cookies.get('jaytel_token')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Administrator authentication required' },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};
