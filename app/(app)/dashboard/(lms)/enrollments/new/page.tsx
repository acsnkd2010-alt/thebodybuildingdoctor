import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import EnrollmentForm from '@/components/admin/EnrollmentForm';

export const metadata = { title: 'New enrollment' };

export default function NewEnrollmentPage({
  searchParams,
}: {
  searchParams: { uid?: string };
}) {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/enrollments"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to enrollments
      </Link>
      <EnrollmentForm defaultUid={searchParams.uid ?? ''} />
    </div>
  );
}
