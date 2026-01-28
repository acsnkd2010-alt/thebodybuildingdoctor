import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

const JWT_SECRET = process.env.JWT_SECRET;
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { message: 'Email, username, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API URL not configured' },
        { status: 500 }
      );
    }

    // Register user via our BMC WordPress plugin (respects WP "Anyone can register")
    const wpRegisterUrl = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/register`;

    const wpResponse = await fetch(wpRegisterUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });

    const registerData = await wpResponse.json().catch(() => ({}));

    if (!wpResponse.ok) {
      return NextResponse.json(
        {
          message:
            registerData?.message ||
            (registerData?.code === 'rest_no_route'
              ? 'WordPress registration endpoint not found. Activate the BMC plugin on WordPress.'
              : 'Registration failed')
        },
        { status: wpResponse.status }
      );
    }

    const wpUser = registerData.user;

    // Auto-login after registration (JWT plugin preferred, fallback to BMC token)
    const jwtEndpoint = `${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token`;
    const bmcEndpoint = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/token`;

    async function tryAuth(url: string) {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json().catch(() => ({}));
      return { res, data };
    }

    let { res: authResponse, data: authData } = await tryAuth(jwtEndpoint);
    if (!authResponse.ok && authData?.code === 'rest_no_route') {
      ({ res: authResponse, data: authData } = await tryAuth(bmcEndpoint));
    }

    if (!authResponse.ok) {
      return NextResponse.json(
        { message: 'Account created. Please log in manually.' },
        { status: 201 }
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
    console.error('Registration error:', error);
    return NextResponse.json(
      { message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
