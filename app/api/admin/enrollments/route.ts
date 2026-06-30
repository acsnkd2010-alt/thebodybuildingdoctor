import { NextRequest, NextResponse } from 'next/server';

import {
  deleteEnrollment,
  enrollUser,
  listEnrollments,
  revokeEnrollment,
} from '@/lib/db/enrollments';
import { getCourseById } from '@/lib/db/courses';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const uid = request.nextUrl.searchParams.get('uid') ?? undefined;
    const courseId = request.nextUrl.searchParams.get('courseId') ?? undefined;
    const enrollments = await listEnrollments({ uid, courseId });
    return NextResponse.json({ enrollments });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load enrollments';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';
    const courseId = typeof body.courseId === 'string' ? body.courseId.trim() : '';

    if (!uid || !courseId) {
      return NextResponse.json({ message: 'uid and courseId are required' }, { status: 400 });
    }

    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }

    const source =
      body.source === 'free' || body.source === 'purchase' || body.source === 'admin'
        ? body.source
        : 'admin';
    const status =
      body.status === 'active' || body.status === 'expired' || body.status === 'revoked'
        ? body.status
        : 'active';
    const expiresAt =
      typeof body.expiresAt === 'string' && body.expiresAt
        ? new Date(body.expiresAt)
        : null;

    const enrollment = await enrollUser(uid, courseId, source, { status, expiresAt });
    return NextResponse.json({ enrollment }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to grant enrollment';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const uid = request.nextUrl.searchParams.get('uid');
  const courseId = request.nextUrl.searchParams.get('courseId');
  const hard = request.nextUrl.searchParams.get('hard') === 'true';

  if (!uid || !courseId) {
    return NextResponse.json({ message: 'uid and courseId are required' }, { status: 400 });
  }

  try {
    if (hard) {
      await deleteEnrollment(uid, courseId);
    } else {
      await revokeEnrollment(uid, courseId);
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete enrollment';
    return NextResponse.json({ message }, { status: 500 });
  }
}
