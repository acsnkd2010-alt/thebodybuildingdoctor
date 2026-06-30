import { NextRequest, NextResponse } from 'next/server';

import { deleteCourse, getCourseById, getCourseLessons, updateCourse } from '@/lib/db/courses';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const [course, lessons] = await Promise.all([
      getCourseById(params.id),
      getCourseLessons(params.id),
    ]);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json({ course, lessons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load course';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const fields = [
      'title',
      'slug',
      'description',
      'thumbnailUrl',
      'instructorName',
      'level',
      'category',
      'published',
      'priceCents',
      'order',
    ] as const;

    for (const field of fields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const course = await updateCourse(params.id, updates);
    if (!course) {
      return NextResponse.json({ message: 'Course not found' }, { status: 404 });
    }
    return NextResponse.json(course);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update course';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    await deleteCourse(params.id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete course';
    return NextResponse.json({ message }, { status: 500 });
  }
}
