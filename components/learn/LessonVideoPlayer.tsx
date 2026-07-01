'use client';

import { useEffect, useState } from 'react';

import VideoPlayer from '@/components/learn/VideoPlayer';
import type { PlaybackConfig } from '@/lib/learning/playback';

type LessonVideoPlayerProps = {
  courseId: string;
  lessonId: string;
  title: string;
};

export default function LessonVideoPlayer({
  courseId,
  lessonId,
  title,
}: LessonVideoPlayerProps) {
  const [playback, setPlayback] = useState<PlaybackConfig | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/learn/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/playback`,
          { cache: 'no-store' },
        );
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.message || 'Could not load video');
        }
        if (!cancelled) {
          setPlayback(data.playback as PlaybackConfig);
        }
      } catch (err) {
        if (!cancelled) {
          setPlayback(null);
          setError(err instanceof Error ? err.message : 'Could not load video');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [courseId, lessonId]);

  if (loading) {
    return (
      <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-sm text-slate-500">
        Loading video…
      </div>
    );
  }

  if (error || !playback) {
    return (
      <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-6 text-center text-sm text-slate-400">
        {error ?? 'Video unavailable'}
      </div>
    );
  }

  return <VideoPlayer playback={playback} title={title} />;
}
