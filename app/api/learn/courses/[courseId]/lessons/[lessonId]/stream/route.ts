import { NextResponse } from 'next/server';

import {
  assertLessonPlaybackAccess,
  getLearnAccessUser,
} from '@/lib/auth/require-learn-access';
import { verifyStreamAccess } from '@/lib/auth/stream-token';
import { isYoutubeUrl, isVimeoUrl } from '@/lib/learning/video';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } },
) {
  const token = new URL(request.url).searchParams.get('token');
  let uid: string | null = null;

  if (token) {
    const payload = await verifyStreamAccess(token);
    if (
      !payload ||
      payload.courseId !== params.courseId ||
      payload.lessonId !== params.lessonId
    ) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    uid = payload.uid;
  } else {
    const user = await getLearnAccessUser(request);
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    uid = user.uid;
  }

  const access = await assertLessonPlaybackAccess(uid, params.courseId, params.lessonId);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const sourceUrl = access.lesson.videoUrl.trim();
  if (!sourceUrl || isYoutubeUrl(sourceUrl) || isVimeoUrl(sourceUrl)) {
    return NextResponse.json({ message: 'Stream not available' }, { status: 400 });
  }

  return NextResponse.redirect(sourceUrl, {
    headers: {
      'Cache-Control': 'private, no-store',
    },
  });
}
