import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import CourseForm from '@/components/admin/CourseForm';
import LessonManager from '@/components/admin/LessonManager';
import { getCourseById, getCourseLessons } from '@/lib/db/courses';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  return { title: course ? `Edit: ${course.title}` : 'Edit course' };
}

export default async function EditCoursePage({ params }: { params: { id: string } }) {
  const [course, lessons] = await Promise.all([
    getCourseById(params.id),
    getCourseLessons(params.id),
  ]);

  if (!course) notFound();

  return (
    <div className="space-y-8">
      <Link
        href={`/dashboard/courses/${course.id}`}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to course
      </Link>

      <CourseForm course={course} />
      <LessonManager courseId={course.id} initialLessons={lessons} />
    </div>
  );
}
