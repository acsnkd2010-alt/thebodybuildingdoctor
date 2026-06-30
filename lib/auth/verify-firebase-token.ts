import { verifyFirebaseIdToken } from '@/lib/auth/verify-firebase-id-token';

export async function verifyBearerToken(request: Request) {
  const header = request.headers.get('authorization');
  const token = header?.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) return null;

  try {
    return await verifyFirebaseIdToken(token);
  } catch {
    return null;
  }
}
