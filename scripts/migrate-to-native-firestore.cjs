#!/usr/bin/env node
/**
 * One-time migration: copy data from MongoDB-compatible Firestore database
 * (thebodybuildingdoctor) into native Firestore ((default) or FIRESTORE_DATABASE_ID).
 *
 * Prerequisites:
 * 1. Create a native Firestore database in Firebase Console.
 * 2. Set legacy MongoDB connection vars in .env.local (see .env.example migration section).
 *
 * Usage: npm run firestore:migrate
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { GoogleAuth } = require('google-auth-library');
const { MongoClient } = require('mongodb');
const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

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

function buildLegacyMongoUri() {
  const dbName = process.env.MONGODB_LEGACY_DATABASE ?? 'thebodybuildingdoctor';
  const uid = process.env.FIRESTORE_DATABASE_UID ?? 'd2283118-5dcf-4ba0-aab3-4b0cdb9a1ee9';
  const location = process.env.FIRESTORE_DATABASE_LOCATION ?? 'nam5';
  const host = `${uid}.${location}.firestore.goog`;
  return `mongodb://${host}:443/${dbName}?loadBalanced=true&tls=true&retryWrites=false&authMechanism=MONGODB-OIDC`;
}

function createMongoClient(uri, serviceAccount) {
  const googleAuth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ['https://www.googleapis.com/auth/cloud-platform'],
  });

  return new MongoClient(uri, {
    authMechanismProperties: {
      ALLOWED_HOSTS: ['*.firestore.goog'],
      TOKEN_RESOURCE: 'FIRESTORE',
      OIDC_CALLBACK: async () => {
        const gcpClient = await googleAuth.getClient();
        const token = await gcpClient.getAccessToken();
        if (!token.token) throw new Error('Failed to get GCP access token');
        return { accessToken: token.token };
      },
    },
  });
}

function stripMongoId(doc) {
  const { _id, ...rest } = doc;
  return { id: String(_id), data: rest };
}

async function copyCollection(mongoDb, firestore, mongoName, options = {}) {
  const { transform } = options;
  const docs = await mongoDb.collection(mongoName).find().toArray();
  let count = 0;

  for (const doc of docs) {
    const { id, data } = stripMongoId(doc);
    const payload = transform ? transform(id, data) : data;
    if (payload === null) continue;

    if (typeof payload === 'object' && payload.ref && payload.data) {
      await payload.ref.set(payload.data, { merge: true });
    } else {
      await firestore.collection(mongoName).doc(id).set(payload, { merge: true });
    }
    count += 1;
  }

  return count;
}

async function main() {
  loadEnvLocal();

  const serviceAccount = loadServiceAccount();
  if (!serviceAccount) {
    console.error('Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY');
    process.exit(1);
  }

  const targetDatabaseId =
    process.env.FIRESTORE_DATABASE_ID ??
    process.env.NEXT_PUBLIC_FIREBASE_DATABASE_ID ??
    '(default)';

  const legacyDbName = process.env.MONGODB_LEGACY_DATABASE ?? 'thebodybuildingdoctor';
  const uri = (process.env.MONGODB_LEGACY_URI || '').trim() || buildLegacyMongoUri();

  console.log('Source: MongoDB-compatible Firestore database', legacyDbName);
  console.log('Target: native Firestore database', targetDatabaseId);
  console.log('---');

  if (!getApps().length) {
    initializeApp({ credential: cert(serviceAccount) });
  }

  const firestore = getFirestore(targetDatabaseId);

  try {
    await firestore.collection('_migration_probe').doc('probe').set({ at: new Date() });
    await firestore.collection('_migration_probe').doc('probe').delete();
  } catch (error) {
    console.error('Target database is not writable via native Firestore API:', error.message);
    console.error('Create a native Firestore database in Firebase Console first.');
    process.exit(1);
  }

  const client = createMongoClient(uri, serviceAccount);
  await client.connect();
  const mongoDb = client.db(legacyDbName);

  const courses = await copyCollection(mongoDb, firestore, 'courses');
  console.log(`✓ courses: ${courses}`);

  const lessons = await copyCollection(mongoDb, firestore, 'lessons', {
    transform: (id, data) => {
      const courseId = data.courseId;
      if (!courseId) return null;
      const { courseId: _omit, ...lesson } = data;
      return {
        ref: firestore.collection('courses').doc(courseId).collection('lessons').doc(id),
        data: { ...lesson, courseId },
      };
    },
  });
  console.log(`✓ lessons (subcollections): ${lessons}`);

  const enrollments = await copyCollection(mongoDb, firestore, 'enrollments');
  console.log(`✓ enrollments: ${enrollments}`);

  const users = await copyCollection(mongoDb, firestore, 'users');
  console.log(`✓ users: ${users}`);

  const blogs = await copyCollection(mongoDb, firestore, 'blogs');
  console.log(`✓ blogs: ${blogs}`);

  const blogAccess = await copyCollection(mongoDb, firestore, 'blog_access');
  console.log(`✓ blog_access: ${blogAccess}`);

  await client.close();
  console.log('');
  console.log('Migration complete. Set FIRESTORE_DATABASE_ID=(default) and restart the app.');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
