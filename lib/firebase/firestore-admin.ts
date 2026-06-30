import { getFirestore, type Firestore } from 'firebase-admin/firestore';

import { getAdminApp } from './admin';

const FIRESTORE_DATABASE_ID =
  process.env.FIRESTORE_DATABASE_ID ?? process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ?? '(default)';

export function getFirestoreAdmin(): Firestore {
  return getFirestore(getAdminApp(), FIRESTORE_DATABASE_ID);
}
