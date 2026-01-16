import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect admin routes
 * - Checks for admin_session cookie existence
 * - Redirects to login if not authenticated
 * - API routes perform full session validation
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for non-admin routes
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    return NextResponse.next();
  }

  // Allow access to login page and auth endpoints
  if (
    pathname === '/admin/login' ||
    pathname === '/admin' ||
    pathname === '/api/admin/auth'
  ) {
    return NextResponse.next();
  }

  // Check for session cookie
  const sessionCookie = request.cookies.get('admin_session');

  // For admin pages (not API), redirect to login if no session
  if (pathname.startsWith('/admin/') && !sessionCookie) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // For API routes, return 401 if no session
  if (pathname.startsWith('/api/admin/') && !sessionCookie) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized - No session' },
      { status: 401 }
    );
  }

  // Session cookie exists, allow request to proceed
  // Full session validation happens in the API routes
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    // Admin pages
    '/admin/:path*',
    // Admin API routes (except auth which handles its own validation)
    '/api/admin/:path*',
  ],
};
