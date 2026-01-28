import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export type SessionUser = {
  id: number;
  email: string;
  username?: string;
  name?: string;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('session')?.value;

  if (!token || !JWT_SECRET) return null;

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: Number(payload.id),
      email: String(payload.email),
      username: payload.username ? String(payload.username) : undefined,
      name: payload.name ? String(payload.name) : undefined
    };
  } catch {
    return null;
  }
}

