import type { ReactNode } from 'react';

import AdminNav from '@/components/admin/AdminNav';
import { requireAdminPage } from '@/lib/auth/require-admin';

export const dynamic = 'force-dynamic';

export default async function LmsAdminLayout({ children }: { children: ReactNode }) {
  await requireAdminPage();

  return (
    <div className="px-4 py-6 md:px-8 max-w-6xl mx-auto w-full">
      <AdminNav />
      {children}
    </div>
  );
}
