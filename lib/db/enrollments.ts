import { getMongoDb } from '@/lib/mongodb';
import { getCourseById } from '@/lib/db/courses';

export type EnrollmentDoc = {
  _id: string;
  uid: string;
  courseId: string;
  enrolledAt: Date;
  source: 'free' | 'purchase' | 'admin';
  status: 'active' | 'expired' | 'revoked';
  expiresAt?: Date | null;
};

function enrollmentId(uid: string, courseId: string) {
  return `${uid}_${courseId}`;
}

export function serializeEnrollment(doc: EnrollmentDoc) {
  return {
    uid: doc.uid,
    courseId: doc.courseId,
    enrolledAt: doc.enrolledAt.toISOString(),
    source: doc.source,
    status: doc.status,
    expiresAt: doc.expiresAt?.toISOString() ?? null,
  };
}

export async function getEnrollment(uid: string, courseId: string) {
  const db = await getMongoDb();
  const doc = await db
    .collection<EnrollmentDoc>('enrollments')
    .findOne({ _id: enrollmentId(uid, courseId) });
  if (!doc || doc.status !== 'active') return null;
  return serializeEnrollment(doc);
}

export async function getEnrollmentAdmin(uid: string, courseId: string) {
  const db = await getMongoDb();
  const doc = await db
    .collection<EnrollmentDoc>('enrollments')
    .findOne({ _id: enrollmentId(uid, courseId) });
  if (!doc) return null;
  return serializeEnrollment(doc);
}

export async function listUserEnrollments(uid: string) {
  const db = await getMongoDb();
  const docs = await db
    .collection<EnrollmentDoc>('enrollments')
    .find({ uid, status: 'active' })
    .toArray();
  return docs.map(serializeEnrollment);
}

export async function listEnrolledCourses(uid: string) {
  const enrollments = await listUserEnrollments(uid);
  const courses = await Promise.all(enrollments.map((e) => getCourseById(e.courseId)));
  return courses.filter((course): course is NonNullable<typeof course> => course !== null);
}

export async function enrollUser(
  uid: string,
  courseId: string,
  source: EnrollmentDoc['source'] = 'free',
  options: { status?: EnrollmentDoc['status']; expiresAt?: Date | null } = {},
) {
  const db = await getMongoDb();
  const course = await getCourseById(courseId);
  if (!course) throw new Error('Course not found');

  const doc: EnrollmentDoc = {
    _id: enrollmentId(uid, courseId),
    uid,
    courseId,
    enrolledAt: new Date(),
    source,
    status: options.status ?? 'active',
    expiresAt: options.expiresAt ?? null,
  };

  await db.collection<EnrollmentDoc>('enrollments').updateOne(
    { _id: doc._id },
    { $set: doc },
    { upsert: true },
  );

  return serializeEnrollment(doc);
}

export async function revokeEnrollment(uid: string, courseId: string) {
  const db = await getMongoDb();
  await db.collection<EnrollmentDoc>('enrollments').updateOne(
    { _id: enrollmentId(uid, courseId) },
    { $set: { status: 'revoked' } },
  );
}

export async function updateEnrollment(
  uid: string,
  courseId: string,
  updates: Partial<Pick<EnrollmentDoc, 'status' | 'source' | 'expiresAt'>>,
) {
  const db = await getMongoDb();
  const result = await db.collection<EnrollmentDoc>('enrollments').updateOne(
    { _id: enrollmentId(uid, courseId) },
    { $set: updates },
  );
  if (result.matchedCount === 0) return null;
  return getEnrollmentAdmin(uid, courseId);
}

export async function deleteEnrollment(uid: string, courseId: string) {
  const db = await getMongoDb();
  const result = await db
    .collection<EnrollmentDoc>('enrollments')
    .deleteOne({ _id: enrollmentId(uid, courseId) });
  return result.deletedCount > 0;
}

export async function listEnrollments(filters: { uid?: string; courseId?: string } = {}) {
  const db = await getMongoDb();
  const query: Record<string, string> = {};
  if (filters.uid) query.uid = filters.uid;
  if (filters.courseId) query.courseId = filters.courseId;
  const docs = await db.collection<EnrollmentDoc>('enrollments').find(query).toArray();
  return docs.map(serializeEnrollment);
}
