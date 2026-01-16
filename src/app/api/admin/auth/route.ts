import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { cookies, headers } from 'next/headers';
import {
  createAdminSession,
  validateAdminSession,
  terminateAdminSession,
  updateSessionActivity,
} from '@/lib/services/admin-session';
import { checkRateLimit, recordLoginAttempt } from '@/lib/services/rate-limit';
import { createAuditLog } from '@/lib/services/audit';

const LoginSchema = z.object({
  password: z.string().min(1),
});

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}

/**
 * POST - Login
 */
export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';

  try {
    // Check rate limit first
    const rateLimit = await checkRateLimit(ip);
    if (!rateLimit.allowed) {
      // Log failed attempt due to rate limit
      await createAuditLog({
        action: 'ADMIN_LOGIN_BLOCKED',
        resource: 'admin_session',
        details: {
          ip,
          reason: 'rate_limited',
          blockedUntil: rateLimit.blockedUntil?.toISOString(),
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: rateLimit.message,
          blockedUntil: rateLimit.blockedUntil?.toISOString(),
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { password } = LoginSchema.parse(body);

    // Get password hash from environment
    const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

    if (!adminPasswordHash) {
      console.error('ADMIN_PASSWORD_HASH environment variable not set');
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, adminPasswordHash);

    if (!isValidPassword) {
      // Record failed attempt
      await recordLoginAttempt(ip, false);

      // Log failed login
      await createAuditLog({
        action: 'ADMIN_LOGIN_FAILED',
        resource: 'admin_session',
        details: {
          ip,
          userAgent,
          remainingAttempts: rateLimit.remainingAttempts - 1,
        },
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Ongeldig wachtwoord',
          remainingAttempts: rateLimit.remainingAttempts - 1,
        },
        { status: 401 }
      );
    }

    // Password correct - clear rate limit and create session
    await recordLoginAttempt(ip, true);

    const { sessionToken, csrfToken, expiresAt } = await createAdminSession(
      ip,
      userAgent
    );

    // Set cookies
    const cookieStore = await cookies();

    // Session cookie (httpOnly for security)
    cookieStore.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: expiresAt,
      path: '/',
    });

    // CSRF token cookie (readable by JavaScript for form submissions)
    cookieStore.set('csrf_token', csrfToken, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: expiresAt,
      path: '/',
    });

    // Log successful login
    await createAuditLog({
      action: 'ADMIN_LOGIN_SUCCESS',
      resource: 'admin_session',
      details: {
        ip,
        userAgent,
        sessionExpires: expiresAt.toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      expiresAt: expiresAt.toISOString(),
    });

  } catch (error) {
    console.error('Admin auth error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Ongeldig verzoek' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

/**
 * GET - Verify session
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    const session = await validateAdminSession(sessionToken);

    if (!session) {
      // Clear invalid cookie
      cookieStore.delete('admin_session');
      cookieStore.delete('csrf_token');

      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      );
    }

    // Update activity timestamp
    await updateSessionActivity(session.id);

    return NextResponse.json({
      authenticated: true,
      expiresAt: session.expiresAt.toISOString(),
      csrfToken: session.csrfToken,
    });

  } catch (error) {
    console.error('Session check error:', error);
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Logout
 */
export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request);

  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (sessionToken) {
      await terminateAdminSession(sessionToken);

      // Log logout
      await createAuditLog({
        action: 'ADMIN_LOGOUT',
        resource: 'admin_session',
        details: { ip },
      });
    }

    cookieStore.delete('admin_session');
    cookieStore.delete('csrf_token');

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, error: 'Er is een fout opgetreden' },
      { status: 500 }
    );
  }
}

/**
 * Helper to verify admin session from middleware or other routes
 */
export async function verifyAdminSessionFromCookie(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) return false;

    const session = await validateAdminSession(sessionToken);
    if (!session) return false;

    // Update activity
    await updateSessionActivity(session.id);
    return true;
  } catch {
    return false;
  }
}
