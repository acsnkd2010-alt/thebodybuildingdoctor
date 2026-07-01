import { NextResponse } from 'next/server';

import {
  assertLessonPlaybackAccess,
  getLearnAccessUser,
} from '@/lib/auth/require-learn-access';
import { signStreamAccess, verifyStreamAccess } from '@/lib/auth/stream-token';
import { resolveLessonPlayback } from '@/lib/learning/playback';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string; lessonId: string } },
) {
  const user = await getLearnAccessUser(request);
  if (!user) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const access = await assertLessonPlaybackAccess(user.uid, params.courseId, params.lessonId);
  if (!access.ok) {
    return NextResponse.json({ message: access.message }, { status: access.status });
  }

  const streamPath = `/api/learn/courses/${encodeURIComponent(params.courseId)}/lessons/${encodeURIComponent(params.lessonId)}/stream`;
  const playback = resolveLessonPlayback(access.lesson.videoUrl, streamPath);
  if (!playback) {
    return NextResponse.json({ message: 'Video unavailable' }, { status: 404 });
  }

  const usedBearer = Boolean(request.headers.get('authorization')?.startsWith('Bearer '));
  if (playback.provider === 'file' && usedBearer) {
    const token = await signStreamAccess({
      uid: user.uid,
      courseId: params.courseId,
      lessonId: params.lessonId,
    });
    const origin = new URL(request.url).origin;
    return NextResponse.json(
      {
        playback: {
          provider: 'file',
          playbackUrl: `${origin}${streamPath}?token=${encodeURIComponent(token)}`,
        },
      },
      { headers: { 'Cache-Control': 'private, no-store' } },
    );
  }

  return NextResponse.json(
    { playback },
    {
      headers: {
        'Cache-Control': 'private, no-store',
      },
    },
  );
}
