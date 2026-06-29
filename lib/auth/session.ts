import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

import { ALLOWED_APP_ROLES, hasAppAccess, parseRoles } from './roles';

const JWT_SECRET = process.env.JWT_SECRET;

export type SessionUser = {
  uid: string;
  /** WordPress user ID from Firebase custom claims (used for WP API calls). */
  id: number;
  email: string;
  username?: string;
  name?: string;
  roles: string[];
  role?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token || !JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const roles = parseRoles(payload.roles ?? payload.role);

    if (!hasAppAccess(roles)) {
      return null;
    }

    const uid = payload.uid ? String(payload.uid) : '';
    if (!uid) return null;

    return {
      uid,
      id: Number(payload.id) || 0,
      email: String(payload.email || ''),
      username: payload.username ? String(payload.username) : undefined,
      name: payload.name ? String(payload.name) : undefined,
      roles,
      role: roles.find((role) => ALLOWED_APP_ROLES.includes(role as (typeof ALLOWED_APP_ROLES)[number])),
    };
  } catch {
    return null;
  }
}
