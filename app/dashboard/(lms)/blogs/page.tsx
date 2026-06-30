import { Suspense } from 'react';

import BlogList from '@/components/admin/BlogList';

export const metadata = { title: 'Blogs' };

export default function BlogsAdminPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading blogs…</div>}>
      <BlogList />
    </Suspense>
  );
}
