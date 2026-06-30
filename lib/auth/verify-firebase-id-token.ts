import { createRemoteJWKSet, jwtVerify } from 'jose';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'thebodybuildingdoctor';

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
);

export type VerifiedFirebaseToken = {
  uid: string;
  sub: string;
  email?: string;
  name?: string;
  email_verified?: boolean;
  roles?: unknown;
  wordpressId?: unknown;
};

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  const uid = typeof payload.sub === 'string' ? payload.sub : '';
  if (!uid) {
    throw new Error('Invalid token: missing subject');
  }

  return {
    uid,
    sub: uid,
    email: typeof payload.email === 'string' ? payload.email : undefined,
    name: typeof payload.name === 'string' ? payload.name : undefined,
    email_verified:
      typeof payload.email_verified === 'boolean' ? payload.email_verified : undefined,
    roles: payload.roles,
    wordpressId: payload.wordpressId,
  };
}
