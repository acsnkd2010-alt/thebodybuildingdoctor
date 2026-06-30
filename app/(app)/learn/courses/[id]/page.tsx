import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import EnrollmentNotice from '@/components/learn/EnrollmentNotice';
import { LessonList } from '@/components/learn/CourseLearnCard';
import { requireLearnerPage } from '@/lib/auth/require-learner';
import { getCourseById, getCourseLessons } from '@/lib/db/courses';
import { getEnrollment } from '@/lib/db/enrollments';
import { formatDuration } from '@/lib/learning/format';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  return { title: course?.title ?? 'Course' };
}

export default async function LearnCoursePage({ params }: { params: { id: string } }) {
  const user = await requireLearnerPage(`/learn/courses/${params.id}`);

  const course = await getCourseById(params.id);
  if (!course || !course.published) notFound();

  const [lessons, enrollment] = await Promise.all([
    getCourseLessons(params.id),
    getEnrollment(user.uid, params.id),
  ]);

  const enrolled = enrollment !== null;

  const visibleLessons = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    order: lesson.order,
    durationSec: lesson.durationSec,
    freePreview: lesson.freePreview,
    locked: !enrolled && !lesson.freePreview,
  }));

  const firstAccessible = visibleLessons.find((l) => !l.locked);

  return (
    <div className="min-h-full px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/learn"
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          All courses
        </Link>

        {course.thumbnailUrl && (
          <img
            src={course.thumbnailUrl}
            alt=""
            className="w-full aspect-video object-cover rounded-2xl border border-slate-800"
          />
        )}

        <header className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <span className="pill capitalize">{course.level}</span>
            <span className="pill">{course.category}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">{course.title}</h1>
          <p className="text-slate-400 text-sm leading-relaxed">{course.description}</p>
          <p className="text-xs text-slate-500">
            {course.instructorName} · {course.lessonCount} lessons ·{' '}
            {formatDuration(course.totalDurationSec)}
          </p>
        </header>

        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <EnrollmentNotice enrolled={enrolled} />
          {enrolled && firstAccessible && (
            <Link
              href={`/learn/courses/${course.id}/lessons/${firstAccessible.id}`}
              className="rounded-full border border-slate-700 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 text-center"
            >
              {visibleLessons.some((l) => l.locked) ? 'Start / preview' : 'Start course'}
            </Link>
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-slate-200">Lessons</h2>
          <LessonList courseId={course.id} lessons={visibleLessons} enrolled={enrolled} />
        </section>
      </div>
    </div>
  );
}
