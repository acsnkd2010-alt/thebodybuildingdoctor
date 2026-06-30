#!/usr/bin/env node
/**
 * Import Tutor LMS export into Firestore.
 * Usage: node scripts/import-tutor-courses.cjs [--file=../data/courses-tutor-export.json]
 */
const { readFileSync } = require('fs');
const { resolve } = require('path');
const { FieldValue, getFirestoreDb, loadEnvLocal } = require('./firestore-client.cjs');

function loadEnvLocal() {
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
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function inferCategory(course) {
  const text = `${course.slug} ${course.title}`.toLowerCase();
  if (text.includes('anabolic') || text.includes('aas') || text.includes('fertility')) {
    return 'Performance';
  }
  if (text.includes('consultation') || text.includes('personal-training') || text.includes('coaching')) {
    return 'Coaching';
  }
  if (text.includes('bulk') || text.includes('lean') || text.includes('workout')) {
    return 'Training';
  }
  return 'Training';
}

function inferLevel(course) {
  const text = `${course.slug} ${course.title}`.toLowerCase();
  if (text.includes('blueprint') || text.includes('anabolic') || text.includes('fertility')) {
    return 'advanced';
  }
  if (text.includes('consultation') || text.includes('personal-training')) {
    return 'intermediate';
  }
  return 'beginner';
}

function isDirectVideo(url) {
  return Boolean(url && /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url));
}

function pickVideoUrl(lesson) {
  const video = lesson.video || {};

  if (isDirectVideo(video.source_html5)) return video.source_html5;

  for (const item of lesson.videos || []) {
    const candidate = item.watch_url || item.url;
    if (isDirectVideo(candidate)) return candidate;
  }

  if (lesson.youtube_embed_url) return lesson.youtube_embed_url;
  if (video.source_youtube) return video.source_youtube;
  if (lesson.youtube_watch_url) return lesson.youtube_watch_url;

  for (const item of lesson.videos || []) {
    const candidate = item.watch_url || item.url;
    if (candidate) return candidate;
  }

  return '';
}

function lessonDurationSec(lesson) {
  const raw = lesson.video?.duration_sec;
  const parsed = Number.parseFloat(raw);
  if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);

  const runtime = lesson.video?.runtime;
  if (runtime) {
    const hours = Number.parseInt(runtime.hours || '0', 10) || 0;
    const minutes = Number.parseInt(runtime.minutes || '0', 10) || 0;
    const seconds = Number.parseInt(runtime.seconds || '0', 10) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

function parseDate(value) {
  if (!value) return new Date();
  const normalized = String(value).replace(' ', 'T');
  const date = new Date(normalized);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

async function main() {
  loadEnvLocal();

  const fileArg = process.argv.find((arg) => arg.startsWith('--file='));
  const exportPath = resolve(
    __dirname,
    fileArg ? fileArg.slice('--file='.length) : '../../data/courses-tutor-export.json',
  );

  const exportData = JSON.parse(readFileSync(exportPath, 'utf-8'));
  const courses = exportData.courses || [];

  const db = getFirestoreDb();
  const now = FieldValue.serverTimestamp();

  let courseCount = 0;
  let lessonCount = 0;

  for (let index = 0; index < courses.length; index += 1) {
    const course = courses[index];
    const courseId = course.slug || `tutor-course-${course.wordpress_id || course.id}`;
    const lessons = Array.isArray(course.lessons) ? course.lessons : [];
    const publishedLessons = lessons.filter((lesson) => lesson.status === 'publish');

    publishedLessons.sort((a, b) => (a.menu_order || 0) - (b.menu_order || 0));

    let totalDurationSec = 0;
    const lessonDocs = publishedLessons.map((lesson, lessonIndex) => {
      const durationSec = lessonDurationSec(lesson);
      totalDurationSec += durationSec;
      return {
        id: `tutor-lesson-${lesson.wordpress_id || lesson.id}`,
        courseId,
        title: lesson.title,
        slug: lesson.slug,
        order: lesson.menu_order || lessonIndex + 1,
        durationSec,
        videoUrl: pickVideoUrl(lesson),
        contentHtml: lesson.content_html || '',
        freePreview: lessonIndex === 0,
        thumbnailUrl: lesson.thumbnail?.url || '',
        tutorId: lesson.wordpress_id || lesson.id,
        tutorLink: lesson.link || '',
      };
    });

    const courseRef = db.collection('courses').doc(courseId);
    const existingCourse = await courseRef.get();

    await courseRef.set(
      {
        title: course.title,
        slug: course.slug,
        description: stripHtml(course.description_html) || course.excerpt || course.title,
        descriptionHtml: course.description_html || '',
        thumbnailUrl: course.thumbnail?.url || '',
        instructorName: 'The Bodybuilding Doctor',
        level: inferLevel(course),
        category: inferCategory(course),
        published: course.status === 'publish',
        priceCents: 0,
        lessonCount: lessonDocs.length,
        totalDurationSec,
        order: index + 1,
        tutorId: course.wordpress_id || course.id,
        tutorLink: course.link || '',
        updatedAt: now,
        ...(existingCourse.exists ? {} : { createdAt: parseDate(course.created_at) }),
      },
      { merge: true },
    );

    courseCount += 1;

    for (const lessonDoc of lessonDocs) {
      const { id, ...lessonData } = lessonDoc;
      await db.collection('lessons').doc(id).set(lessonData, { merge: true });
      lessonCount += 1;
    }

    console.log(
      `✓ ${course.title} (${courseId}) — ${lessonDocs.length} lessons, ${totalDurationSec}s total`,
    );
  }

  console.log('');
  console.log(`Imported ${courseCount} courses and ${lessonCount} lessons from ${exportPath}`);
  console.log(`Stats from export: ${exportData.stats?.courses ?? '?'} courses, ${exportData.stats?.lessons ?? '?'} lessons`);
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
