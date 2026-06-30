#!/usr/bin/env node
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { GoogleAuth } = require('google-auth-library');
const { MongoClient } = require('mongodb');

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

function buildFirestoreMongoUri() {
  const dbName = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';
  const uid = process.env.FIRESTORE_DATABASE_UID ?? 'd2283118-5dcf-4ba0-aab3-4b0cdb9a1ee9';
  const location = process.env.FIRESTORE_DATABASE_LOCATION ?? 'nam5';
  const host = `${uid}.${location}.firestore.goog`;
  return `mongodb://${host}:443/${dbName}?loadBalanced=true&tls=true&retryWrites=false&authMechanism=MONGODB-OIDC`;
}

function createMongoClient(uri) {
  const serviceAccount = loadServiceAccount();
  const usesOidc = uri.includes('authMechanism=MONGODB-OIDC') || uri.includes('.firestore.goog');

  if (!usesOidc || !serviceAccount) {
    return new MongoClient(uri);
  }

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

async function main() {
  loadEnvLocal();
  const dbName = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';
  const uri = (process.env.MONGODB_URI || '').trim() || buildFirestoreMongoUri();

  console.log('Firebase project: thebodybuildingdoctor');
  console.log('---');

  if (!loadServiceAccount() && !process.env.MONGODB_URI) {
    console.log('✗ Set GOOGLE_APPLICATION_CREDENTIALS or FIREBASE_SERVICE_ACCOUNT_KEY in web/.env.local');
    process.exit(1);
  }

  try {
    const client = createMongoClient(uri);
    await client.connect();
    const count = await client.db(dbName).collection('courses').countDocuments();
    console.log('✓ Firestore connected');
    console.log('  Database:', dbName);
    console.log('  Courses:', count);
    await client.close();
  } catch (error) {
    console.log('✗ Firestore connection failed:', error.message);
    process.exit(1);
  }
}

main();
