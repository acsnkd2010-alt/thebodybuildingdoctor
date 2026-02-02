import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

/** Only these roles can access the Next.js app. */
const ALLOWED_APP_ROLES = ['media_channel', 'administrator'];

export type SessionUser = {
  id: number;
  email: string;
  username?: string;
  name?: string;
  role?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token || !JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    const role = payload.role ? String(payload.role) : undefined;

    if (!role || !ALLOWED_APP_ROLES.includes(role)) {
      return null;
    }

    return {
      id: Number(payload.id),
      email: String(payload.email),
      username: payload.username ? String(payload.username) : undefined,
      name: payload.name ? String(payload.name) : undefined,
      role,
    };
  } catch {
    return null;
  }
}

