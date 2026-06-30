import { NextRequest, NextResponse } from 'next/server';

import { listEnrolledCourses } from '@/lib/db/enrollments';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(request: NextRequest) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const courses = await listEnrolledCourses(decoded.uid);
    return NextResponse.json({ courses });
  } catch (error: unknown) {
    console.error('GET /api/courses', error);
    const message = error instanceof Error ? error.message : 'Failed to load courses';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}
