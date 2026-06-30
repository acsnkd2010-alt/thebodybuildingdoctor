'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import {
  deleteBlogAccess,
  fetchBlogAccess,
  fetchUser,
  type BlogAccess,
  type AdminUser,
} from '@/lib/admin-api';

export default function BlogAccessView({ uid }: { uid: string }) {
  const router = useRouter();
  const [blogAccess, setBlogAccess] = useState<BlogAccess | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [accessData, userData] = await Promise.all([
          fetchBlogAccess(uid),
          fetchUser(uid).catch(() => null),
        ]);
        setBlogAccess(accessData.blogAccess);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load blog access');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [uid]);

  async function handleDelete() {
    if (!confirm('Remove blog access for this user?')) return;
    setDeleting(true);
    try {
      await deleteBlogAccess(uid, true);
      router.push('/dashboard/blog-access');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove blog access');
      setDeleting(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading…</div>;
  }

  if (error || !blogAccess) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error ?? 'Blog access not found'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/dashboard/blog-access"
        backLabel="Back to blog access"
        title={user?.displayName || user?.email || blogAccess.uid}
        editHref={`/dashboard/blog-access/${encodeURIComponent(uid)}/edit`}
        onDelete={handleDelete}
        deleting={deleting}
      />

      <div className="card-surface p-6 grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">Email</div>
          <div className="text-slate-200">{user?.email ?? '—'}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">User ID</div>
          <div className="text-slate-200 font-mono text-xs">{blogAccess.uid}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Granted</div>
          <div className="text-slate-200">
            {new Date(blogAccess.grantedAt).toLocaleString()}
          </div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`pill ${blogAccess.status === 'active' ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
          >
            {blogAccess.status}
          </span>
        </div>
        {blogAccess.note && (
          <div className="md:col-span-2">
            <div className="text-xs text-slate-500 mb-1">Note</div>
            <div className="text-slate-300">{blogAccess.note}</div>
          </div>
        )}
      </div>
    </div>
  );
}
