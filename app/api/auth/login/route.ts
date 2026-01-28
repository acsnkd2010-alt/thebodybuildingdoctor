import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API URL not configured' },
        { status: 500 }
      );
    }

    const loginId = username || email;

    // Authenticate with WordPress REST API.
    // Prefer JWT plugin endpoint; fallback to our BMC plugin endpoint if JWT plugin isn't installed.
    const jwtEndpoint = `${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token`;
    const bmcEndpoint = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/token`;

    async function tryAuth(url: string) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginId, password })
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    }

    let { res: wpResponse, data: wpData } = await tryAuth(jwtEndpoint);

    // If WP returns "No route was found..." then JWT plugin isn't installed/configured.
    if (!wpResponse.ok && wpData?.code === 'rest_no_route') {
      ({ res: wpResponse, data: wpData } = await tryAuth(bmcEndpoint));
    }

    if (!wpResponse.ok) {
      return NextResponse.json(
        {
          message:
            wpData?.message ||
            (wpData?.code === 'rest_no_route'
              ? 'WordPress auth endpoint not found. Install/configure JWT plugin or activate BMC plugin.'
              : 'Invalid credentials')
        },
        { status: wpResponse.status || 401 }
      );
    }

    const wpUser = wpData.user || wpData.data?.user;

    if (!wpUser) {
      return NextResponse.json(
        { message: 'Failed to retrieve user data' },
        { status: 500 }
      );
    }

    // Check if user has required role (Media Channel Member or admin)
    const userRole = wpUser.role || wpUser.roles?.[0];
    const allowedRoles = ['media_channel_member', 'administrator', 'editor', 'author'];
    
    if (userRole && !allowedRoles.includes(userRole)) {
      return NextResponse.json(
        { 
          message: 'Your account does not have access to the Media Channel. Please contact an administrator to upgrade your account.',
          code: 'INSUFFICIENT_PERMISSIONS'
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
      email: wpUser.email || email,
      username: wpUser.username || username,
      name: wpUser.name || wpUser.display_name,
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
        email: wpUser.email || email,
        username: wpUser.username || username,
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
