import { NextRequest, NextResponse } from 'next/server';

import { getCourseById, getLessonById } from '@/lib/db/courses';
import { getEnrollment } from '@/lib/db/enrollments';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; lessonId: string } },
) {
  const decoded = await verifyBearerToken(_request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const course = await getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const lesson = await getLessonById(params.lessonId, params.id);
    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }

    const enrollment = await getEnrollment(decoded.uid, params.id);
    const canAccess = Boolean(enrollment) || lesson.freePreview;

    if (!canAccess) {
      return NextResponse.json(
        { message: 'You do not have access to this lesson. Contact an administrator.' },
        { status: 403 },
      );
    }

    return NextResponse.json({ course, lesson });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load lesson';
    return NextResponse.json({ message }, { status: 500 });
  }
}
