import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth, type Auth } from 'firebase-admin/auth';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'thebodybuildingdoctor';

function readServiceAccountFile(filePath: string): Record<string, string> | null {
  const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
  if (!existsSync(resolved)) return null;
  return JSON.parse(readFileSync(resolved, 'utf-8')) as Record<string, string>;
}

function loadServiceAccount(): Record<string, string> | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) {
    return JSON.parse(json) as Record<string, string>;
  }

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    const fromEnv = readServiceAccountFile(credPath);
    if (fromEnv) return fromEnv;
  }

  if (process.env.NODE_ENV !== 'production') {
    return readServiceAccountFile('serviceAccountKey.json');
  }

  return null;
}

function getAdminApp(): App {
  if (getApps().length) return getApps()[0]!;

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) {
    return initializeApp({
      credential: cert(serviceAccount),
      projectId: PROJECT_ID,
    });
  }

  throw new Error(
    'Firebase Admin credentials missing. Set FIREBASE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS, or add serviceAccountKey.json for local dev.'
  );
}

export function getFirebaseAdminAuth(): Auth {
  return getAuth(getAdminApp());
}
