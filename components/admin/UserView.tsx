'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { deleteUser, type AdminUser } from '@/lib/admin-api';
import { isAdmin } from '@/lib/auth/roles';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

export default function UserView({ user }: { user: AdminUser }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete user ${user.email || user.uid}? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteUser(user.uid);
      router.push('/dashboard/users');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
      setDeleting(false);
    }
  }

  const roles = user.roles.length > 0 ? user.roles : [user.role];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/dashboard/users"
        backLabel="Back to users"
        title={user.displayName || user.email || user.uid}
        editHref={`/dashboard/users/${user.uid}/edit`}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <div className="card-surface p-6 grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">Email</div>
          <div className="text-slate-100">{user.email || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">UID</div>
          <div className="text-slate-100 font-mono text-xs">{user.uid}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Display name</div>
          <div className="text-slate-100">{user.displayName || '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`pill ${user.disabled ? 'border-red-800 text-red-300' : 'border-emerald-700 text-emerald-300'}`}
          >
            {user.disabled ? 'Disabled' : 'Active'}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Joined</div>
          <div className="text-slate-300">{formatDate(user.createdAt)}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Last sign-in</div>
          <div className="text-slate-300">{formatDate(user.lastSignIn)}</div>
        </div>
        <div className="md:col-span-2">
          <div className="text-xs text-slate-500 mb-2">Roles</div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <span
                key={role}
                className={`pill ${isAdmin([role]) ? 'border-amber-600 text-amber-300' : ''}`}
              >
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link
          href={`/dashboard/enrollments/new?uid=${encodeURIComponent(user.uid)}`}
          className="inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Enroll in course
        </Link>
        <Link
          href={`/dashboard/blog-access/new?uid=${encodeURIComponent(user.uid)}`}
          className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          Grant blog access
        </Link>
        <Link
          href={`/dashboard/enrollments?uid=${encodeURIComponent(user.uid)}`}
          className="inline-flex rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
        >
          View enrollments
        </Link>
      </div>
    </div>
  );
}
