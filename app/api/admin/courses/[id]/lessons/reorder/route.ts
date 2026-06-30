import { NextRequest, NextResponse } from 'next/server';

import { requireAdminApi } from '@/lib/auth/require-admin';
import { reorderLessons } from '@/lib/db/courses';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const lessonIds = body.lessonIds;

    if (!Array.isArray(lessonIds) || lessonIds.some((id) => typeof id !== 'string' || !id.trim())) {
      return NextResponse.json(
        { message: 'lessonIds must be an array of lesson ID strings' },
        { status: 400 },
      );
    }

    const lessons = await reorderLessons(params.id, lessonIds.map((id: string) => id.trim()));
    return NextResponse.json({ lessons });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to reorder lessons';
    const status = message.includes('not found') ? 404 : 400;
    return NextResponse.json({ message }, { status });
  }
}
