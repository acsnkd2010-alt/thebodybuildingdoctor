import { NextRequest, NextResponse } from 'next/server';

import {
  listEnrolledCourses,
  listUserEnrollments,
} from '@/lib/db/enrollments';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const withCourses = request.nextUrl.searchParams.get('courses') === 'true';
    if (withCourses) {
      const courses = await listEnrolledCourses(decoded.uid);
      return NextResponse.json({ courses });
    }

    const enrollments = await listUserEnrollments(decoded.uid);
    return NextResponse.json({ enrollments });
  } catch (error: unknown) {
    console.error('GET /api/enrollments', error);
    const message = error instanceof Error ? error.message : 'Failed to load enrollments';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { message: 'Enrollment is managed by an administrator. Please contact your coach to get access.' },
    { status: 403 },
  );
}
