const { readFileSync } = require('fs');
const { resolve } = require('path');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

function loadEnvLocal() {
  const envPath = resolve(__dirname, '../.env.local');
  try {
    const raw = readFileSync(envPath, 'utf-8');
    for (const line of raw.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const idx = trimmed.indexOf('=');
      if (idx === -1) continue;
      const key = trimmed.slice(0, idx);
      const value = trimmed.slice(idx + 1);
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // optional
  }
}

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) return JSON.parse(json);

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    return JSON.parse(readFileSync(resolve(__dirname, '..', credPath), 'utf-8'));
  }

  return null;
}

function getFirestoreDb() {
  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    throw new Error('Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY in web/.env.local');
  }

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const databaseId =
    process.env.FIRESTORE_DATABASE_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ??
    '(default)';

  return getFirestore(databaseId);
}

module.exports = {
  FieldValue,
  getFirestoreDb,
  loadEnvLocal,
};
