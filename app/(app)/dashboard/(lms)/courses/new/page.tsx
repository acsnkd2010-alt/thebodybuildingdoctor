import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import CourseForm from '@/components/admin/CourseForm';

export const metadata = { title: 'New course' };

export default function NewCoursePage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/courses"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to courses
      </Link>
      <CourseForm />
    </div>
  );
}
