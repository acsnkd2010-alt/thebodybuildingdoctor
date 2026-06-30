import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { readFileSync } from 'fs';
import type { Auth } from 'firebase-admin/auth';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'thebodybuildingdoctor';

function loadServiceAccount(): Record<string, string> | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    return JSON.parse(json) as Record<string, string>;
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    return JSON.parse(readFileSync(credPath, 'utf-8')) as Record<string, string>;
  }

  return null;
}

export function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID,
    });
  }

  throw new Error(
    'Server auth is not configured. Add FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS to web/.env.local (Firebase Console → Project settings → Service accounts → Generate new private key).',
  );
}

let authPromise: Promise<Auth> | null = null;

/** Lazy-load firebase-admin/auth to avoid jwks-rsa ESM issues on auth routes. */
export async function getFirebaseAdminAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = import('firebase-admin/auth').then(({ getAuth }) => getAuth(getAdminApp()));
  }
  return authPromise;
}
