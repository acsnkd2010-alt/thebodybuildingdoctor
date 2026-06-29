import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

import { hasAppAccess, parseRoles, primaryAppRole } from '../../../../lib/auth/roles';
import { getFirebaseAdminAuth } from '../../../../lib/firebase/admin';

const JWT_SECRET = process.env.JWT_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idToken = typeof body.idToken === 'string' ? body.idToken.trim() : '';

    if (!idToken) {
      return NextResponse.json({ message: 'Missing authentication token' }, { status: 400 });
    }

    if (!JWT_SECRET) {
      return NextResponse.json({ message: 'JWT secret not configured' }, { status: 500 });
    }

    const adminAuth = getFirebaseAdminAuth();
    let decoded;

    try {
      decoded = await adminAuth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json({ message: 'Invalid or expired credentials' }, { status: 401 });
    }

    const fbUser = await adminAuth.getUser(decoded.uid);
    const claims = fbUser.customClaims || {};
    const roles = parseRoles(claims.roles);

    if (!hasAppAccess(roles)) {
      return NextResponse.json(
        {
          message:
            'Only Media Channel members can access this app. Please contact an administrator to upgrade your account.',
          code: 'INSUFFICIENT_PERMISSIONS',
        },
        { status: 403 }
      );
    }

    const wordpressId = claims.wordpressId != null ? Number(claims.wordpressId) : 0;
    const role = primaryAppRole(roles) || '';
    const email = fbUser.email || decoded.email || '';
    const name = fbUser.displayName || undefined;

    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({
      uid: fbUser.uid,
      id: wordpressId,
      email,
      name,
      roles,
      role,
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

    return NextResponse.json({
      success: true,
      user: {
        uid: fbUser.uid,
        id: wordpressId,
        email,
        name,
        roles,
        role,
      },
    });
  } catch (error: unknown) {
    console.error('Login error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ message }, { status: 500 });
  }
}
