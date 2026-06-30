import { Suspense } from 'react';

import BlogAccessList from '@/components/admin/BlogAccessList';

export const metadata = { title: 'Blog access' };

export default function BlogAccessAdminPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading blog access…</div>}>
      <BlogAccessList />
    </Suspense>
  );
}
