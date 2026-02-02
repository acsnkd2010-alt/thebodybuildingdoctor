import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '') || '';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, username, password } = body;

    // Form sends "Email or Username" in `email` for login; `username` is empty. WordPress expects "username" and "password".
    const loginId = (username && String(username).trim()) || (email && String(email).trim());
    if (!loginId || !password) {
      return NextResponse.json(
        { message: 'Email or username, and password are required' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API URL not configured' },
        { status: 500 }
      );
    }

    // Authenticate with WordPress REST API.
    // Try BMC plugin first (supports email or username); fallback to JWT plugin if BMC not available.
    const baseUrl = WORDPRESS_API_URL;
    const bmcEndpoint = `${baseUrl}/wp-json/bmc/v1/auth/token`;
    const jwtEndpoint = `${baseUrl}/wp-json/jwt-auth/v1/token`;

    async function tryAuth(url: string) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId, password }),
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    }

    let { res: wpResponse, data: wpData } = await tryAuth(bmcEndpoint);

    if (!wpResponse.ok && wpData?.code === 'rest_no_route') {
      ({ res: wpResponse, data: wpData } = await tryAuth(jwtEndpoint));
    }

    if (!wpResponse.ok) {
      const status = wpResponse.status || 401;
      const wpMessage = wpData?.message;
      const isInvalidCreds = status === 401 && (wpMessage?.toLowerCase().includes('invalid') || wpMessage?.toLowerCase().includes('password') || wpMessage?.toLowerCase().includes('credential'));
      const message =
        wpMessage ||
        (wpData?.code === 'rest_no_route'
          ? 'WordPress auth endpoint not found. Install/configure JWT plugin or activate BMC plugin.'
          : isInvalidCreds
            ? 'Invalid email/username or password. If this works locally, check that the app is using the correct WordPress URL in production and that your user exists there.'
            : 'Invalid credentials');
      return NextResponse.json({ message }, { status });
    }

    const wpUser = wpData.user || wpData.data?.user;

    if (!wpUser) {
      return NextResponse.json(
        { message: 'Failed to retrieve user data' },
        { status: 500 }
      );
    }

    // Only media_channel role (and administrator) can access this app
    const userRole = wpUser.role || wpUser.roles?.[0] || '';
    const allowedRoles = ['media_channel', 'administrator'];

    if (!allowedRoles.includes(userRole)) {
      return NextResponse.json(
        {
          message: 'Only Media Channel members can access this app. Please contact an administrator to upgrade your account.',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 }
      );
    }

    // Create our own JWT session token
    if (!JWT_SECRET) {
      return NextResponse.json(
        { message: 'JWT secret not configured' },
        { status: 500 }
      );
    }

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      id: wpUser.id,
      email: wpUser.email || (loginId.includes('@') ? loginId : undefined),
      username: wpUser.username || (loginId.includes('@') ? undefined : loginId),
      name: wpUser.name || wpUser.display_name,
      role: userRole,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('30d')
      .sign(secret);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: {
        id: wpUser.id,
        email: wpUser.email,
        username: wpUser.username,
        name: wpUser.name || wpUser.display_name,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
