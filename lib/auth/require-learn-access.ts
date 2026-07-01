import { hasAppAccess, parseRoles } from '@/lib/auth/roles';
import { getSessionUser } from '@/lib/auth/session';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';
import { getCourseById, getLessonById } from '@/lib/db/courses';
import { getEnrollment } from '@/lib/db/enrollments';

export type LearnAccessUser = {
  uid: string;
};

export async function getLearnAccessUser(request: Request): Promise<LearnAccessUser | null> {
  const sessionUser = await getSessionUser();
  if (sessionUser) {
    return { uid: sessionUser.uid };
  }

  const decoded = await verifyBearerToken(request);
  if (!decoded) return null;

  const roles = parseRoles(decoded.roles);
  if (!hasAppAccess(roles)) return null;

  return { uid: decoded.uid };
}

export async function assertLessonPlaybackAccess(
  uid: string,
  courseId: string,
  lessonId: string,
) {
  const course = await getCourseById(courseId);
  if (!course || !course.published) {
    return { ok: false as const, status: 404, message: 'Course not found' };
  }

  const lesson = await getLessonById(lessonId, courseId);
  if (!lesson) {
    return { ok: false as const, status: 404, message: 'Lesson not found' };
  }

  const enrollment = await getEnrollment(uid, courseId);
  const canAccess = Boolean(enrollment) || lesson.freePreview;
  if (!canAccess) {
    return { ok: false as const, status: 403, message: 'Enrollment required' };
  }

  return { ok: true as const, lesson };
}
