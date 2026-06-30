#!/usr/bin/env node
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { MongoClient } = require('mongodb');

function loadEnvLocal() {
  const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    process.env[trimmed.slice(0, idx)] = trimmed.slice(idx + 1);
  }
}

async function main() {
  loadEnvLocal();
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';

  console.log('Firebase project: thebodybuildingdoctor');
  console.log('---');

  if (!uri) {
    console.log('✗ MONGODB_URI missing in web/.env.local');
    process.exit(1);
  }

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const count = await client.db(dbName).collection('courses').countDocuments();
    console.log('✓ Cloud Firestore (MongoDB API) connected');
    console.log('  Database:', dbName);
    console.log('  Courses:', count);
    await client.close();
  } catch (error) {
    console.log('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

main();
