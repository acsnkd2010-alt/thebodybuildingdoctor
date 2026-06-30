import { MongoClient, type Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DATABASE = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';

let client: MongoClient | null = null;
let db: Db | null = null;

export function getMongoDatabaseName() {
  return MONGODB_DATABASE;
}

export async function getMongoDb(): Promise<Db> {
  if (!MONGODB_URI) {
    throw new Error(
      'MONGODB_URI is not configured. Add your Firestore MongoDB connection string to web/.env.local',
    );
  }

  if (db) return db;

  client = new MongoClient(MONGODB_URI);
  await client.connect();
  db = client.db(MONGODB_DATABASE);
  return db;
}
