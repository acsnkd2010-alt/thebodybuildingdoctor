import { NextRequest, NextResponse } from 'next/server';

import { createWebSessionFromIdToken } from '@/lib/auth/create-web-session';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';

    if (!idToken) {
      return NextResponse.json({ message: 'Missing authentication token' }, { status: 400 });
    }

    const result = await createWebSessionFromIdToken(idToken);
    if (!result.ok) {
      return NextResponse.json(
        { message: result.message, code: result.code },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const rawMessage = error instanceof Error ? error.message : 'Internal server error';
    const message = rawMessage.includes('Server auth is not configured')
      ? rawMessage
      : 'Login failed. Please try again.';
    return NextResponse.json({ message }, { status: 500 });
  }
}
