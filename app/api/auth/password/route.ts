import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '../../../../lib/auth/session';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword } = body;
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: 'New password must be at least 6 characters' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API not configured' },
        { status: 500 }
      );
    }

    const url = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/password`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (WORDPRESS_API_KEY) headers.Authorization = `Bearer ${WORDPRESS_API_KEY}`;

    const wpRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        user_id: user.id,
        current_password: currentPassword,
        new_password: newPassword,
      }),
    });

    if (!wpRes.ok) {
      const data = await wpRes.json().catch(() => ({}));
      return NextResponse.json(
        { message: data?.message || 'Failed to change password' },
        { status: wpRes.status }
      );
    }

    return NextResponse.json({ success: true, message: 'Password updated' });
  } catch (error: unknown) {
    console.error('Password change error:', error);
    const message = error instanceof Error ? error.message : 'Failed to change password';
    return NextResponse.json({ message }, { status: 500 });
  }
}
