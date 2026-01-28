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

    // Register user via WordPress REST API
    const wpRegisterUrl = `${WORDPRESS_API_URL}/wp-json/wp/v2/users`;
    
    const wpResponse = await fetch(wpRegisterUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // WordPress may require authentication for user registration
        // You might need to add Authorization header with app password
        ...(process.env.WORDPRESS_API_KEY && {
          Authorization: `Basic ${Buffer.from(
            `:${process.env.WORDPRESS_API_KEY}`
          ).toString('base64')}`,
        }),
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    if (!wpResponse.ok) {
      const error = await wpResponse.json().catch(() => ({}));
      return NextResponse.json(
        { message: error.message || 'Registration failed' },
        { status: wpResponse.status }
      );
    }

    const wpUser = await wpResponse.json();

    // Auto-login after registration
    const wpAuthUrl = `${WORDPRESS_API_URL}/wp-json/jwt-auth/v1/token`;
    const authResponse = await fetch(wpAuthUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    if (!authResponse.ok) {
      // Registration succeeded but auto-login failed
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
