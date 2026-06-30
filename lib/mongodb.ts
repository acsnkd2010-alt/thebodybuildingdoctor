import { readFileSync } from 'fs';
import { resolve } from 'path';

import { GoogleAuth } from 'google-auth-library';
import { MongoClient, type Db } from 'mongodb';

const MONGODB_DATABASE =
  process.env.MONGODB_DATABASE ??
  process.env.MONGODB_LEGACY_DATABASE ??
  'thebodybuildingdoctor';

let client: MongoClient | null = null;
let db: Db | null = null;

function loadServiceAccount() {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (json) return JSON.parse(json) as Record<string, unknown>;

  const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (credPath) {
    return JSON.parse(readFileSync(resolve(process.cwd(), credPath), 'utf-8')) as Record<
      string,
      unknown
    >;
  }

  return null;
}

function buildFirestoreMongoUri() {
  const uid = process.env.FIRESTORE_DATABASE_UID ?? 'd2283118-5dcf-4ba0-aab3-4b0cdb9a1ee9';
  const location = process.env.FIRESTORE_DATABASE_LOCATION ?? 'nam5';
  const host = `${uid}.${location}.firestore.goog`;
  return `mongodb://${host}:443/${MONGODB_DATABASE}?loadBalanced=true&tls=true&retryWrites=false&authMechanism=MONGODB-OIDC`;
}

function resolveMongoUri() {
  const explicit = (process.env.MONGODB_URI || '').trim();
  if (explicit) return explicit;

  const serviceAccount = loadServiceAccount();
  if (serviceAccount) return buildFirestoreMongoUri();

  return null;
}

function createMongoClient(uri: string) {
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

export function getMongoDatabaseName() {
  return MONGODB_DATABASE;
}

export async function getMongoDb(): Promise<Db> {
  const uri = resolveMongoUri();
  if (!uri) {
    throw new Error(
      'Firestore is not configured. Set MONGODB_URI or GOOGLE_APPLICATION_CREDENTIALS in web/.env.local',
    );
  }

  if (db) return db;

  client = createMongoClient(uri);
  await client.connect();
  db = client.db(MONGODB_DATABASE);
  return db;
}
