import Link from 'next/link';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

import VideoPlayer from '@/components/learn/VideoPlayer';
import { formatDuration } from '@/lib/learning/format';

type LessonNav = {
  id: string;
  title: string;
} | null;

type LessonPlayerProps = {
  courseId: string;
  courseTitle: string;
  lesson: {
    id: string;
    title: string;
    durationSec: number;
    videoUrl: string;
    contentHtml?: string;
  };
  prevLesson: LessonNav;
  nextLesson: LessonNav;
};

export default function LessonPlayerView({
  courseId,
  courseTitle,
  lesson,
  prevLesson,
  nextLesson,
}: LessonPlayerProps) {
  return (
    <div className="min-h-full px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <Link
            href={`/learn/courses/${courseId}`}
            className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200 mb-3"
          >
            <ChevronLeftIcon className="w-4 h-4" />
            {courseTitle}
          </Link>
          <h1 className="text-2xl font-bold text-slate-100">{lesson.title}</h1>
          <p className="text-sm text-slate-500 mt-1">{formatDuration(lesson.durationSec)}</p>
        </div>

        <VideoPlayer url={lesson.videoUrl} title={lesson.title} />

        {lesson.contentHtml && (
          <div
            className="card-surface p-6 prose prose-invert prose-sm max-w-none rich-text-editor-content"
            dangerouslySetInnerHTML={{ __html: lesson.contentHtml }}
          />
        )}

        <nav className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-slate-800">
          {prevLesson ? (
            <Link
              href={`/learn/courses/${courseId}/lessons/${prevLesson.id}`}
              className="flex-1 card-surface p-4 hover:border-slate-600 transition flex items-center gap-2"
            >
              <ChevronLeftIcon className="w-5 h-5 text-slate-400 shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-slate-500">Previous</p>
                <p className="text-sm font-medium text-slate-200 truncate">{prevLesson.title}</p>
              </div>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          {nextLesson ? (
            <Link
              href={`/learn/courses/${courseId}/lessons/${nextLesson.id}`}
              className="flex-1 card-surface p-4 hover:border-slate-600 transition flex items-center gap-2 text-right"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-500">Next</p>
                <p className="text-sm font-medium text-slate-200 truncate">{nextLesson.title}</p>
              </div>
              <ChevronRightIcon className="w-5 h-5 text-slate-400 shrink-0" />
            </Link>
          ) : null}
        </nav>
      </div>
    </div>
  );
}
