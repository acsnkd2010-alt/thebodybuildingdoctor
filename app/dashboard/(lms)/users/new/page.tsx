import Link from 'next/link';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import UserForm from '@/components/admin/UserForm';

export const metadata = { title: 'New user' };

export default function NewUserPage() {
  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/users"
        className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="w-4 h-4" />
        Back to users
      </Link>
      <UserForm />
    </div>
  );
}
