import { NextRequest, NextResponse } from 'next/server';

import { getCourseById, getCourseLessons } from '@/lib/db/courses';
import { getEnrollment } from '@/lib/db/enrollments';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const course = await getCourseById(params.id);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const lessons = await getCourseLessons(params.id);
    const decoded = await verifyBearerToken(request);
    let enrolled = false;

    if (decoded) {
      const enrollment = await getEnrollment(decoded.uid, params.id);
      enrolled = enrollment !== null;
    }

    const visibleLessons = lessons.map((lesson) => {
      const locked = !lesson.freePreview && !enrolled;
      if (locked) {
        return {
          id: lesson.id,
          courseId: lesson.courseId,
          title: lesson.title,
          order: lesson.order,
          durationSec: lesson.durationSec,
          freePreview: lesson.freePreview,
          locked: true,
        };
      }
      return { ...lesson, locked: false };
    });

    if (!decoded) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    if (!enrolled) {
      return NextResponse.json(
        { message: 'You are not enrolled in this course. Contact an administrator for access.' },
        { status: 403 },
      );
    }

    return NextResponse.json({ course, lessons: visibleLessons, enrolled });
  } catch (error: unknown) {
    console.error('GET /api/courses/[id]', error);
    const message = error instanceof Error ? error.message : 'Failed to load course';
    return NextResponse.json({ message }, { status: 500 });
  }
}
