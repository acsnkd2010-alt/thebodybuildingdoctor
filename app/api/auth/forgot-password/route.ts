import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim() : '';
    if (!email) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API not configured' },
        { status: 500 }
      );
    }

    const url = `${WORDPRESS_API_URL}/wp-json/bmc/v1/auth/forgot-password`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (WORDPRESS_API_KEY) headers.Authorization = `Bearer ${WORDPRESS_API_KEY}`;

    const wpRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    });

    if (!wpRes.ok) {
      const data = await wpRes.json().catch(() => ({}));
      if (data?.code === 'rest_no_route') {
        const wpLoginUrl = WORDPRESS_API_URL.replace(/\/wp-json.*$/, '') + '/wp-login.php?action=lostpassword';
        return NextResponse.json({
          success: false,
          message: 'Password reset is not configured. Use the link below to reset via WordPress.',
          reset_url: wpLoginUrl,
        }, { status: 200 });
      }
      return NextResponse.json(
        { message: data?.message || 'Failed to send reset email' },
        { status: wpRes.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'If an account exists for this email, you will receive a password reset link.',
    });
  } catch (error: unknown) {
    console.error('Forgot password error:', error);
    const message = error instanceof Error ? error.message : 'Failed to send reset email';
    return NextResponse.json({ message }, { status: 500 });
  }
}
