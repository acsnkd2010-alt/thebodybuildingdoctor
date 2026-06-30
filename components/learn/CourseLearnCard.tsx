import Link from 'next/link';
import { AcademicCapIcon, LockClosedIcon, PlayCircleIcon } from '@heroicons/react/24/outline';

import { formatDuration } from '@/lib/learning/format';

export type LearnCourse = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  instructorName: string;
  level: string;
  category: string;
  lessonCount: number;
  totalDurationSec: number;
  priceCents: number;
};

type CourseLearnCardProps = {
  course: LearnCourse;
  enrolled?: boolean;
  href: string;
};

export default function CourseLearnCard({ course, enrolled, href }: CourseLearnCardProps) {
  return (
    <Link
      href={href}
      className="card-surface group overflow-hidden flex flex-col hover:border-slate-600 transition"
    >
      {course.thumbnailUrl ? (
        <img
          src={course.thumbnailUrl}
          alt=""
          className="w-full aspect-video object-cover border-b border-slate-800"
        />
      ) : (
        <div className="aspect-video bg-slate-900 border-b border-slate-800 flex items-center justify-center">
          <AcademicCapIcon className="w-12 h-12 text-slate-600" />
        </div>
      )}
      <div className="p-5 flex-1 flex flex-col gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="pill text-[10px] capitalize">{course.level}</span>
          {enrolled && (
            <span className="pill text-[10px] border-emerald-700 text-emerald-300">Enrolled</span>
          )}
          {!enrolled && (
            <span className="pill text-[10px] border-slate-600 text-slate-400">Members only</span>
          )}
        </div>
        <h3 className="font-semibold text-slate-100 group-hover:text-white">{course.title}</h3>
        <p className="text-xs text-slate-400 line-clamp-2 flex-1">{course.description}</p>
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <PlayCircleIcon className="w-3.5 h-3.5" />
          {course.lessonCount} lessons · {formatDuration(course.totalDurationSec)}
        </p>
      </div>
    </Link>
  );
}

type LessonRow = {
  id: string;
  title: string;
  order: number;
  durationSec: number;
  freePreview: boolean;
  locked: boolean;
};

type LessonListProps = {
  courseId: string;
  lessons: LessonRow[];
  enrolled: boolean;
};

export function LessonList({ courseId, lessons, enrolled }: LessonListProps) {
  if (lessons.length === 0) {
    return (
      <p className="text-sm text-slate-400 card-surface p-6 text-center">No lessons published yet.</p>
    );
  }

  return (
    <ol className="card-surface divide-y divide-slate-800">
      {lessons.map((lesson, index) => {
        const accessible = enrolled || lesson.freePreview;
        const content = (
          <>
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-medium text-slate-300">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`font-medium truncate ${accessible ? 'text-slate-100' : 'text-slate-500'}`}>
                {lesson.title}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {formatDuration(lesson.durationSec)}
                {lesson.freePreview && !enrolled && (
                  <span className="ml-2 text-sky-400">Preview</span>
                )}
              </p>
            </div>
            {lesson.locked ? (
              <LockClosedIcon className="w-5 h-5 text-slate-600 shrink-0" />
            ) : (
              <PlayCircleIcon className="w-5 h-5 text-accent shrink-0" />
            )}
          </>
        );

        if (!accessible) {
          return (
            <li key={lesson.id} className="flex items-center gap-3 p-4 opacity-60">
              {content}
            </li>
          );
        }

        return (
          <li key={lesson.id}>
            <Link
              href={`/learn/courses/${courseId}/lessons/${lesson.id}`}
              className="flex items-center gap-3 p-4 hover:bg-slate-900/50 transition"
            >
              {content}
            </Link>
          </li>
        );
      })}
    </ol>
  );
}
