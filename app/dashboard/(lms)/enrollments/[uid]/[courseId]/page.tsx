import { Suspense } from 'react';

import EnrollmentView from '@/components/admin/EnrollmentView';

export const metadata = { title: 'Enrollment' };

export default function ViewEnrollmentPage({
  params,
}: {
  params: { uid: string; courseId: string };
}) {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <EnrollmentView uid={params.uid} courseId={params.courseId} />
    </Suspense>
  );
}
