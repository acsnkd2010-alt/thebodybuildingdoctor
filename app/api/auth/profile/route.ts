import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { getSessionUser } from '@/lib/auth/session';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;
const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = 'force-dynamic';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email } = body;
    if (!name && !email) {
      return NextResponse.json(
        { message: 'Provide at least name or email to update' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API not configured' },
        { status: 500 }
      );
    }

    const url = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/profile`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (WORDPRESS_API_KEY) headers.Authorization = `Bearer ${WORDPRESS_API_KEY}`;

    const wpRes = await fetch(url, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        user_id: user.id,
        name: name ?? undefined,
        email: email ?? undefined,
      }),
    });

    const data = await wpRes.json().catch(() => ({}));
    const updatedUser = {
      id: user.id,
      email: (wpRes.ok ? (data.email ?? email) : null) ?? user.email,
      username: (wpRes.ok ? (data.username ?? user.username) : null) ?? user.username,
      name: (wpRes.ok ? (data.name ?? name) : null) ?? user.name ?? name ?? user.name,
    };
    if (name !== undefined) updatedUser.name = name;
    if (email !== undefined) updatedUser.email = email;

    if (!wpRes.ok) {
      if (data?.code === 'rest_no_route') {
        updatedUser.name = name ?? user.name ?? updatedUser.name;
        updatedUser.email = email ?? user.email ?? updatedUser.email;
      } else {
        return NextResponse.json(
          { message: data?.message || 'Failed to update profile' },
          { status: wpRes.status }
        );
      }
    }

    if (JWT_SECRET) {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const token = await new SignJWT({
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        name: updatedUser.name,
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('30d')
        .sign(secret);
      const cookieStore = await cookies();
      cookieStore.set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error: unknown) {
    console.error('Profile update error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ message }, { status: 500 });
  }
}
