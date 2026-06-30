import { NextRequest, NextResponse } from 'next/server';

import {
  deleteEnrollment,
  getEnrollmentAdmin,
  revokeEnrollment,
  updateEnrollment,
} from '@/lib/db/enrollments';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { uid: string; courseId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const enrollment = await getEnrollmentAdmin(params.uid, params.courseId);
    if (!enrollment) {
      return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
    }
    return NextResponse.json({ enrollment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load enrollment';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string; courseId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updates: {
      status?: 'active' | 'expired' | 'revoked';
      source?: 'free' | 'purchase' | 'admin';
      expiresAt?: Date | null;
    } = {};

    if (body.status === 'active' || body.status === 'expired' || body.status === 'revoked') {
      updates.status = body.status;
    }
    if (body.source === 'free' || body.source === 'purchase' || body.source === 'admin') {
      updates.source = body.source;
    }
    if (body.expiresAt === null) {
      updates.expiresAt = null;
    } else if (typeof body.expiresAt === 'string' && body.expiresAt) {
      updates.expiresAt = new Date(body.expiresAt);
    }

    const enrollment = await updateEnrollment(params.uid, params.courseId, updates);
    if (!enrollment) {
      return NextResponse.json({ message: 'Enrollment not found' }, { status: 404 });
    }
    return NextResponse.json({ enrollment });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update enrollment';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string; courseId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const hard = request.nextUrl.searchParams.get('hard') === 'true';

  try {
    if (hard) {
      await deleteEnrollment(params.uid, params.courseId);
    } else {
      await revokeEnrollment(params.uid, params.courseId);
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete enrollment';
    return NextResponse.json({ message }, { status: 500 });
  }
}
