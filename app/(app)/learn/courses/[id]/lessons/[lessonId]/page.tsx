import { notFound, redirect } from 'next/navigation';

import LessonPlayerView from '@/components/learn/LessonPlayerView';
import { requireLearnerPage } from '@/lib/auth/require-learner';
import { getCourseById, getCourseLessons, getLessonById } from '@/lib/db/courses';
import { getEnrollment } from '@/lib/db/enrollments';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const lesson = await getLessonById(params.lessonId, params.id);
  return { title: lesson?.title ?? 'Lesson' };
}

export default async function LearnLessonPage({
  params,
}: {
  params: { id: string; lessonId: string };
}) {
  const user = await requireLearnerPage(`/learn/courses/${params.id}/lessons/${params.lessonId}`);

  const course = await getCourseById(params.id);
  if (!course || !course.published) notFound();

  const lesson = await getLessonById(params.lessonId, params.id);
  if (!lesson) notFound();

  const enrollment = await getEnrollment(user.uid, params.id);
  const canAccess = Boolean(enrollment) || lesson.freePreview;

  if (!canAccess) {
    redirect(`/learn/courses/${params.id}`);
  }

  const allLessons = await getCourseLessons(params.id);
  const accessibleLessons = allLessons.filter(
    (l) => Boolean(enrollment) || l.freePreview,
  );
  const currentIndex = accessibleLessons.findIndex((l) => l.id === lesson.id);
  const prevLesson =
    currentIndex > 0
      ? { id: accessibleLessons[currentIndex - 1].id, title: accessibleLessons[currentIndex - 1].title }
      : null;
  const nextLesson =
    currentIndex >= 0 && currentIndex < accessibleLessons.length - 1
      ? {
          id: accessibleLessons[currentIndex + 1].id,
          title: accessibleLessons[currentIndex + 1].title,
        }
      : null;

  return (
    <LessonPlayerView
      courseId={course.id}
      courseTitle={course.title}
      lesson={lesson}
      prevLesson={prevLesson}
      nextLesson={nextLesson}
    />
  );
}
