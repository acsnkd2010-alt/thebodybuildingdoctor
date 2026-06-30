import { Suspense } from 'react';

import EnrollmentList from '@/components/admin/EnrollmentList';

export const metadata = { title: 'Enrollments' };

export default function EnrollmentsAdminPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading enrollments…</div>}>
      <EnrollmentList />
    </Suspense>
  );
}
