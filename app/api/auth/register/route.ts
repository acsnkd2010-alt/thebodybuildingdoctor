import { NextRequest, NextResponse } from 'next/server';

import { createWebSessionFromIdToken } from '@/lib/auth/create-web-session';

/** Creates a session after Firebase registration (same role checks as login). */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';

    if (!idToken) {
      return NextResponse.json({ message: 'Missing authentication token' }, { status: 400 });
    }

    const result = await createWebSessionFromIdToken(idToken);
    if (!result.ok) {
      const message =
        result.code === 'INSUFFICIENT_PERMISSIONS'
          ? 'Account created, but administrator access must be assigned by an existing admin.'
          : result.message;
      return NextResponse.json(
        { message, code: result.code },
        { status: result.status },
      );
    }

    return NextResponse.json({ success: true, user: result.user });
  } catch (error: unknown) {
    console.error('Registration error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
