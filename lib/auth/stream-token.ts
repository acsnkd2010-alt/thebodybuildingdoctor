import { jwtVerify, SignJWT } from 'jose';

const STREAM_SECRET = process.env.JWT_SECRET;

type StreamAccessPayload = {
  uid: string;
  courseId: string;
  lessonId: string;
};

function getSecret() {
  if (!STREAM_SECRET) {
    throw new Error('JWT_SECRET is not configured');
  }
  return new TextEncoder().encode(STREAM_SECRET);
}

export async function signStreamAccess(payload: StreamAccessPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('3h')
    .sign(getSecret());
}

export async function verifyStreamAccess(token: string): Promise<StreamAccessPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    const uid = typeof payload.uid === 'string' ? payload.uid : '';
    const courseId = typeof payload.courseId === 'string' ? payload.courseId : '';
    const lessonId = typeof payload.lessonId === 'string' ? payload.lessonId : '';
    if (!uid || !courseId || !lessonId) return null;
    return { uid, courseId, lessonId };
  } catch {
    return null;
  }
}
