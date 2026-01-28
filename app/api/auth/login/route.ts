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

    // Authenticate with WordPress REST API
    // Using Application Password or JWT plugin endpoint
    const wpAuthUrl = `${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token`;
    
    const wpResponse = await fetch(wpAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username || email,
        password,
      }),
    });

    if (!wpResponse.ok) {
      const error = await wpResponse.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || 'Invalid credentials' },
        { status: 401 }
      );
    }

    const wpData = await wpResponse.json();
    const wpUser = wpData.user || wpData.data?.user;

    if (!wpUser) {
      return NextResponse.json(
        { message: 'Failed to retrieve user data' },
        { status: 500 }
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
