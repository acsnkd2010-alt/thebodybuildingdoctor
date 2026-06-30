import { SignJWT } from 'jose';
import { cookies } from 'next/headers';

import { hasAppAccess, parseRoles, primaryAppRole } from '@/lib/auth/roles';
import { verifyFirebaseIdToken } from '@/lib/auth/verify-firebase-id-token';

const JWT_SECRET = process.env.JWT_SECRET;

type SessionResult =
  | {
      ok: true;
      user: {
        uid: string;
        id: number;
        email: string;
        name?: string;
        roles: string[];
        role: string;
      };
    }
  | { ok: false; status: number; message: string; code?: string };

export async function createWebSessionFromIdToken(idToken: string): Promise<SessionResult> {
  if (!JWT_SECRET) {
    return { ok: false, status: 500, message: 'JWT secret not configured' };
  }

  let decoded;
  try {
    decoded = await verifyFirebaseIdToken(idToken);
  } catch {
    return { ok: false, status: 401, message: 'Invalid or expired credentials' };
  }

  const roles = parseRoles(decoded.roles);
  if (!hasAppAccess(roles)) {
    return {
      ok: false,
      status: 403,
      code: 'INSUFFICIENT_PERMISSIONS',
      message:
        'You do not have access to this app. Contact your administrator for a media channel or admin account.',
    };
  }

  const wordpressId = decoded.wordpressId != null ? Number(decoded.wordpressId) : 0;
  const role = primaryAppRole(roles) || '';
  const email = decoded.email || '';
  const name = decoded.name;
  const uid = decoded.uid;

  const secret = new TextEncoder().encode(JWT_SECRET);
  const token = await new SignJWT({
    uid,
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

  return {
    ok: true,
    user: { uid, id: wordpressId, email, name, roles, role },
  };
}
