import Link from 'next/link';

import CourseLearnCard from '@/components/learn/CourseLearnCard';
import { requireLearnerPage } from '@/lib/auth/require-learner';
import { listPublishedCourses } from '@/lib/db/courses';
import { listEnrolledCourses, listUserEnrollments } from '@/lib/db/enrollments';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'My Courses',
};

export default async function LearnPage() {
  const user = await requireLearnerPage();

  const [enrolledCourses, publishedCourses, enrollments] = await Promise.all([
    listEnrolledCourses(user.uid).catch(() => []),
    listPublishedCourses().catch(() => []),
    listUserEnrollments(user.uid).catch(() => []),
  ]);

  const enrolledIds = new Set(enrollments.map((e) => e.courseId));
  const browseCourses = publishedCourses.filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="min-h-full px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-6xl mx-auto space-y-10">
        <header className="space-y-2">
          <div className="pill w-fit">Learning</div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-100">My courses</h1>
          <p className="text-sm text-slate-400 max-w-2xl">
            Watch lessons, follow structured programs, and track your progress — the same courses
            available in the mobile app.
          </p>
        </header>

        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-200">Continue learning</h2>
          {enrolledCourses.length === 0 ? (
            <div className="card-surface p-8 text-center space-y-3">
              <p className="text-slate-300 font-medium">No enrollments yet</p>
              <p className="text-sm text-slate-400 max-w-md mx-auto">
                Enroll in a course after your administrator grants access, or submit a request below.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {enrolledCourses.map((course) => (
                <CourseLearnCard
                  key={course.id}
                  course={course}
                  enrolled
                  href={`/learn/courses/${course.id}`}
                />
              ))}
            </div>
          )}
        </section>

        {browseCourses.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-200">Browse courses</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {browseCourses.map((course) => (
                <CourseLearnCard
                  key={course.id}
                  course={course}
                  href={`/learn/courses/${course.id}`}
                />
              ))}
            </div>
          </section>
        )}

        <p className="text-xs text-slate-500 text-center">
          Need help?{' '}
          <Link href="/#apply" className="text-accent hover:underline">
            Request mentorship or course access
          </Link>
        </p>
      </div>
    </div>
  );
}
