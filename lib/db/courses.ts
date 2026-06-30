import { ObjectId } from 'mongodb';

import { getMongoDb } from '@/lib/mongodb';

export type CourseDoc = {
  _id?: string | ObjectId;
  title: string;
  slug: string;
  description: string;
  descriptionHtml?: string;
  thumbnailUrl: string;
  instructorName: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  published: boolean;
  priceCents: number;
  lessonCount: number;
  totalDurationSec: number;
  order: number;
  tutorId?: number;
  tutorLink?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type LessonDoc = {
  _id?: string | ObjectId;
  courseId: string;
  title: string;
  slug?: string;
  order: number;
  durationSec: number;
  videoUrl: string;
  contentHtml?: string;
  freePreview: boolean;
  thumbnailUrl?: string;
  tutorId?: number;
  tutorLink?: string;
};

function courseId(doc: CourseDoc & { _id?: string | ObjectId }) {
  return String(doc._id);
}

export function serializeCourse(doc: CourseDoc & { _id: string | ObjectId }) {
  return {
    id: courseId(doc),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    descriptionHtml: doc.descriptionHtml,
    thumbnailUrl: doc.thumbnailUrl,
    instructorName: doc.instructorName,
    level: doc.level,
    category: doc.category,
    published: doc.published,
    priceCents: doc.priceCents,
    lessonCount: doc.lessonCount,
    totalDurationSec: doc.totalDurationSec,
    order: doc.order,
    createdAt: doc.createdAt?.toISOString() ?? null,
  };
}

export function serializeLesson(doc: LessonDoc & { _id: string | ObjectId }) {
  return {
    id: String(doc._id),
    courseId: doc.courseId,
    title: doc.title,
    slug: doc.slug,
    order: doc.order,
    durationSec: doc.durationSec,
    videoUrl: doc.videoUrl,
    contentHtml: doc.contentHtml,
    freePreview: doc.freePreview,
    thumbnailUrl: doc.thumbnailUrl,
  };
}

export async function listPublishedCourses() {
  const db = await getMongoDb();
  const docs = await db
    .collection<CourseDoc>('courses')
    .find({ published: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map((doc) => serializeCourse(doc as CourseDoc & { _id: string | ObjectId }));
}

export async function listAllCourses() {
  const db = await getMongoDb();
  const docs = await db.collection<CourseDoc>('courses').find().sort({ order: 1 }).toArray();
  return docs.map((doc) => serializeCourse(doc as CourseDoc & { _id: string | ObjectId }));
}

export async function getCourseById(id: string) {
  const db = await getMongoDb();
  const doc = await db.collection<CourseDoc>('courses').findOne({ _id: id as never });
  if (!doc) return null;
  return serializeCourse(doc as CourseDoc & { _id: string | ObjectId });
}

export async function getCourseLessons(courseId: string) {
  const db = await getMongoDb();
  const docs = await db
    .collection<LessonDoc>('lessons')
    .find({ courseId })
    .sort({ order: 1 })
    .toArray();
  return docs.map((doc) => serializeLesson(doc as LessonDoc & { _id: string | ObjectId }));
}

export async function createCourse(data: Omit<CourseDoc, 'createdAt' | 'updatedAt'>) {
  const db = await getMongoDb();
  const now = new Date();
  const id = data._id ? String(data._id) : new ObjectId().toHexString();
  const doc = { ...data, _id: id, createdAt: now, updatedAt: now };
  await db.collection<CourseDoc>('courses').insertOne(doc);
  return serializeCourse(doc);
}

export async function updateCourse(id: string, updates: Partial<CourseDoc>) {
  const db = await getMongoDb();
  await db
    .collection<CourseDoc>('courses')
    .updateOne({ _id: id as never }, { $set: { ...updates, updatedAt: new Date() } });
  return getCourseById(id);
}

export async function deleteCourse(id: string) {
  const db = await getMongoDb();
  await db.collection<LessonDoc>('lessons').deleteMany({ courseId: id });
  await db.collection('courses').deleteOne({ _id: id as never });
}

export async function syncCourseStats(courseId: string) {
  const lessons = await getCourseLessons(courseId);
  const lessonCount = lessons.length;
  const totalDurationSec = lessons.reduce((sum, lesson) => sum + lesson.durationSec, 0);
  await updateCourse(courseId, { lessonCount, totalDurationSec });
}

export async function getLessonById(lessonId: string, courseId: string) {
  const db = await getMongoDb();
  const doc = await db.collection<LessonDoc>('lessons').findOne({ _id: lessonId as never, courseId });
  if (!doc) return null;
  return serializeLesson(doc as LessonDoc & { _id: string | ObjectId });
}

export async function createLesson(
  courseId: string,
  data: Omit<LessonDoc, 'courseId' | '_id'>,
) {
  const db = await getMongoDb();
  const course = await getCourseById(courseId);
  if (!course) throw new Error('Course not found');

  const id = new ObjectId().toHexString();
  const doc: LessonDoc & { _id: string } = { ...data, courseId, _id: id };
  await db.collection<LessonDoc>('lessons').insertOne(doc);
  await syncCourseStats(courseId);
  return serializeLesson(doc);
}

export async function updateLesson(
  lessonId: string,
  courseId: string,
  updates: Partial<Omit<LessonDoc, 'courseId' | '_id'>>,
) {
  const db = await getMongoDb();
  const result = await db
    .collection<LessonDoc>('lessons')
    .updateOne({ _id: lessonId as never, courseId }, { $set: updates });
  if (result.matchedCount === 0) return null;
  await syncCourseStats(courseId);
  return getLessonById(lessonId, courseId);
}

export async function deleteLesson(lessonId: string, courseId: string) {
  const db = await getMongoDb();
  const result = await db.collection<LessonDoc>('lessons').deleteOne({ _id: lessonId as never, courseId });
  if (result.deletedCount === 0) return false;
  await syncCourseStats(courseId);
  return true;
}
