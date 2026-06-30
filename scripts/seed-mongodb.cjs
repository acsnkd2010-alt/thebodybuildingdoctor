#!/usr/bin/env node
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { MongoClient } = require('mongodb');

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env.local'), 'utf-8');
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

loadEnvLocal();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE ?? 'thebodybuildingdoctor';

if (!uri) {
  console.error('Missing MONGODB_URI in web/.env.local');
  process.exit(1);
}

async function main() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);

  const courseId = 'sample-hypertrophy';
  await db.collection('courses').updateOne(
    { _id: courseId },
    {
      $set: {
        title: 'Hypertrophy Fundamentals',
        slug: 'hypertrophy-fundamentals',
        description: 'Build muscle with evidence-based training principles.',
        thumbnailUrl: 'https://picsum.photos/seed/hypertrophy/800/450',
        instructorName: 'The Bodybuilding Doctor',
        level: 'beginner',
        category: 'Training',
        published: true,
        priceCents: 0,
        lessonCount: 2,
        totalDurationSec: 1200,
        order: 1,
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  await db.collection('lessons').updateOne(
    { _id: 'sample-hypertrophy-lesson-1' },
    {
      $set: {
        courseId,
        title: 'Welcome',
        order: 1,
        durationSec: 300,
        videoUrl: '',
        contentHtml: '<p>Introduction to the program.</p>',
        freePreview: true,
      },
    },
    { upsert: true },
  );

  await db.collection('lessons').updateOne(
    { _id: 'sample-hypertrophy-lesson-2' },
    {
      $set: {
        courseId,
        title: 'Training principles',
        order: 2,
        durationSec: 900,
        videoUrl: '',
        contentHtml: '<p>Volume, intensity, and recovery.</p>',
        freePreview: false,
      },
    },
    { upsert: true },
  );

  console.log('Seeded cloud MongoDB Firestore:', courseId);
  await client.close();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
