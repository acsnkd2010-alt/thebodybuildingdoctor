import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import EnrollmentForm from '@/components/admin/EnrollmentForm';
import { getEnrollmentAdmin } from '@/lib/db/enrollments';

export const dynamic = 'force-dynamic';

export default async function EditEnrollmentPage({
  params,
}: {
  params: { uid: string; courseId: string };
}) {
  const enrollment = await getEnrollmentAdmin(params.uid, params.courseId);
  if (!enrollment) notFound();

  return (
    <div className="space-y-6">
      <Link
        href={`/dashboard/enrollments/${encodeURIComponent(params.uid)}/${encodeURIComponent(params.courseId)}`}
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to enrollment
      </Link>
      <EnrollmentForm enrollment={enrollment} />
    </div>
  );
}
