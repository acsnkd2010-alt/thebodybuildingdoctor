import { NextRequest, NextResponse } from 'next/server';

import { createLesson, getCourseLessons } from '@/lib/db/courses';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const lessons = await getCourseLessons(params.id);
    return NextResponse.json({ lessons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load lessons';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ message: 'Title is required' }, { status: 400 });
    }

    const lessons = await getCourseLessons(params.id);
    const nextOrder =
      typeof body.order === 'number' ? body.order : lessons.length
        ? Math.max(...lessons.map((lesson) => lesson.order)) + 1
        : 1;

    const lesson = await createLesson(params.id, {
      title,
      order: nextOrder,
      durationSec: typeof body.durationSec === 'number' ? body.durationSec : 0,
      videoUrl: typeof body.videoUrl === 'string' ? body.videoUrl : '',
      contentHtml: typeof body.contentHtml === 'string' ? body.contentHtml : '',
      freePreview: body.freePreview === true,
    });

    return NextResponse.json(lesson, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create lesson';
    return NextResponse.json({ message }, { status: 500 });
  }
}
