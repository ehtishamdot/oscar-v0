import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateAdminSession, updateSessionActivity } from './admin-session';
import { createAuditLog } from './audit';

export interface AuthResult {
  authenticated: boolean;
  sessionId?: string;
  error?: string;
}

/**
 * Verify admin session for API routes
 * Call this at the start of protected API handlers
 */
export async function requireAdminAuth(): Promise<AuthResult> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return { authenticated: false, error: 'No session token' };
    }

    const session = await validateAdminSession(sessionToken);

    if (!session) {
      // Log unauthorized access attempt
      await createAuditLog({
        action: 'ADMIN_API_UNAUTHORIZED',
        resource: 'admin_session',
        details: { reason: 'invalid_or_expired_session' },
        outcome: 'failure',
      });

      return { authenticated: false, error: 'Invalid or expired session' };
    }

    // Update activity timestamp
    await updateSessionActivity(session.id);

    return { authenticated: true, sessionId: session.id };
  } catch (error) {
    console.error('Admin auth check error:', error);
    return { authenticated: false, error: 'Authentication check failed' };
  }
}

/**
 * Create an unauthorized response for API routes
 */
export function unauthorizedResponse(message: string = 'Unauthorized') {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

/**
 * Decorator pattern for protecting API route handlers
 * Wraps a handler and ensures admin authentication
 */
export function withAdminAuth<T>(
  handler: (auth: AuthResult) => Promise<NextResponse<T>>
) {
  return async (): Promise<NextResponse<T | { success: false; error: string }>> => {
    const auth = await requireAdminAuth();

    if (!auth.authenticated) {
      return unauthorizedResponse(auth.error);
    }

    return handler(auth);
  };
}
