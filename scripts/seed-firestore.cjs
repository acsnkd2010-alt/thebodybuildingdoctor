#!/usr/bin/env node
const { FieldValue, getFirestoreDb, loadEnvLocal } = require('./firestore-client.cjs');

loadEnvLocal();

async function main() {
  const db = getFirestoreDb();

  const courseId = 'sample-hypertrophy';
  const courseRef = db.collection('courses').doc(courseId);
  const existing = await courseRef.get();

  await courseRef.set(
    {
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
      updatedAt: FieldValue.serverTimestamp(),
      ...(existing.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
    },
    { merge: true },
  );

  await db.collection('lessons').doc('sample-hypertrophy-lesson-1').set(
    {
      courseId,
      title: 'Welcome',
      order: 1,
      durationSec: 300,
      videoUrl: '',
      contentHtml: '<p>Introduction to the program.</p>',
      freePreview: true,
    },
    { merge: true },
  );

  await db.collection('lessons').doc('sample-hypertrophy-lesson-2').set(
    {
      courseId,
      title: 'Progressive Overload',
      order: 2,
      durationSec: 900,
      videoUrl: '',
      contentHtml: '<p>How to apply progressive overload.</p>',
      freePreview: false,
    },
    { merge: true },
  );

  console.log('✓ Seeded sample course in Firestore');
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
