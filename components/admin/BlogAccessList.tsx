'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

import AdminActions from '@/components/admin/AdminActions';
import {
  deleteBlogAccess,
  fetchBlogAccessList,
  fetchUsers,
  type BlogAccess,
  type AdminUser,
} from '@/lib/admin-api';

export default function BlogAccessList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [blogAccess, setBlogAccess] = useState<BlogAccess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  const userMap = Object.fromEntries(users.map((user) => [user.uid, user]));

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [userData, accessData] = await Promise.all([
        fetchUsers(),
        fetchBlogAccessList(),
      ]);
      setUsers(userData.users);
      setBlogAccess(accessData.blogAccess);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blog access');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(access: BlogAccess) {
    if (!confirm('Remove blog access for this user?')) return;
    setDeletingUid(access.uid);
    try {
      await deleteBlogAccess(access.uid, true);
      setBlogAccess((prev) => prev.filter((item) => item.uid !== access.uid));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove blog access');
    } finally {
      setDeletingUid(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading blog access…</div>;
  }

  if (error) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error}
        <button type="button" onClick={load} className="block mt-3 text-accent underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-slate-400">
          {blogAccess.length} user{blogAccess.length === 1 ? '' : 's'} with blog access
        </p>
        <Link
          href="/dashboard/blog-access/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          <PlusIcon className="w-4 h-4" />
          Grant access
        </Link>
      </div>

      {blogAccess.length === 0 ? (
        <div className="card-surface p-8 text-center text-slate-400">
          No users have blog access yet. Grant access so they can read articles in the mobile app.
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Granted</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {blogAccess.map((access) => {
                const user = userMap[access.uid];
                return (
                  <tr key={access.uid} className="hover:bg-slate-900/40">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-100">
                        {user?.displayName || user?.email || access.uid}
                      </div>
                      <div className="text-xs text-slate-500">{user?.email ?? access.uid}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell text-slate-300">
                      {new Date(access.grantedAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`pill ${access.status === 'active' ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
                      >
                        {access.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <AdminActions
                        viewHref={`/dashboard/blog-access/${encodeURIComponent(access.uid)}`}
                        editHref={`/dashboard/blog-access/${encodeURIComponent(access.uid)}/edit`}
                        onDelete={() => handleDelete(access)}
                        deleting={deletingUid === access.uid}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
