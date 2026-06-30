import { notFound } from 'next/navigation';

import CourseView from '@/components/admin/CourseView';
import { getCourseById, getCourseLessons } from '@/lib/db/courses';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { id: string } }) {
  const course = await getCourseById(params.id);
  return { title: course ? course.title : 'Course' };
}

export default async function ViewCoursePage({ params }: { params: { id: string } }) {
  const [course, lessons] = await Promise.all([
    getCourseById(params.id),
    getCourseLessons(params.id),
  ]);

  if (!course) notFound();

  return <CourseView course={course} lessons={lessons} />;
}
