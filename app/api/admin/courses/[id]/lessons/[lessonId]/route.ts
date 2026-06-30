import { NextRequest, NextResponse } from 'next/server';

import { deleteLesson, getLessonById, updateLesson } from '@/lib/db/courses';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string; lessonId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const lesson = await getLessonById(params.lessonId, params.id);
    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load lesson';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string; lessonId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const updates: Record<string, unknown> = {};
    const fields = ['title', 'order', 'durationSec', 'videoUrl', 'contentHtml', 'freePreview'] as const;

    for (const field of fields) {
      if (body[field] !== undefined) updates[field] = body[field];
    }

    const lesson = await updateLesson(params.lessonId, params.id, updates);
    if (!lesson) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json(lesson);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update lesson';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; lessonId: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const deleted = await deleteLesson(params.lessonId, params.id);
    if (!deleted) {
      return NextResponse.json({ message: 'Lesson not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete lesson';
    return NextResponse.json({ message }, { status: 500 });
  }
}
