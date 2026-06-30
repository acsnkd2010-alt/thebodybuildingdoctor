'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

import { deleteUser, fetchUsers, type AdminUser } from '@/lib/admin-api';
import AdminActions from '@/components/admin/AdminActions';
import { isAdmin } from '@/lib/auth/roles';

function formatDate(value: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function RoleBadges({ user }: { user: AdminUser }) {
  const badges: string[] = [];

  if (user.roles.length > 0) {
    badges.push(...user.roles);
  } else if (user.role && user.role !== 'student') {
    badges.push(user.role);
  }

  if (badges.length === 0) {
    return <span className="pill">student</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {badges.map((role) => (
        <span
          key={role}
          className={`pill ${
            isAdmin([role])
              ? 'border-amber-600 text-amber-300'
              : role === 'media_channel'
                ? 'border-sky-700 text-sky-300'
                : ''
          }`}
        >
          {role}
        </span>
      ))}
    </div>
  );
}

export default function UserList() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [deletingUid, setDeletingUid] = useState<string | null>(null);

  async function load(searchQuery = query) {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchUsers(searchQuery ? { q: searchQuery } : undefined);
      setUsers(data.users);
      setTotal(data.total ?? data.users.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    setQuery(search.trim());
    load(search.trim());
  }

  function handleClear() {
    setSearch('');
    setQuery('');
    load('');
  }

  async function handleDelete(user: AdminUser) {
    if (!confirm(`Delete user ${user.email || user.uid}?`)) return;
    setDeletingUid(user.uid);
    try {
      await deleteUser(user.uid);
      setUsers((prev) => prev.filter((item) => item.uid !== user.uid));
      setTotal((prev) => prev - 1);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete user');
    } finally {
      setDeletingUid(null);
    }
  }

  if (loading && users.length === 0) {
    return <div className="text-sm text-slate-400">Loading users…</div>;
  }

  if (error && users.length === 0) {
    return (
      <div className="card-surface p-6 text-sm text-red-300">
        {error}
        <button type="button" onClick={() => load()} className="block mt-3 text-accent underline">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-sm text-slate-400">
          {total} user{total === 1 ? '' : 's'}
          {query ? ` matching "${query}"` : ''}
        </p>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link
            href="/dashboard/users/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            <PlusIcon className="w-4 h-4" />
            New user
          </Link>
          <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1 sm:w-72">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              className="w-full rounded-lg border border-slate-700 bg-slate-900/80 pl-9 pr-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none"
              placeholder="Search email, name, or UID"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Search
          </button>
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:bg-slate-800"
            >
              Clear
            </button>
          )}
          </form>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="card-surface p-8 text-center text-slate-400">
          No users found{query ? ` for "${query}"` : ''}.
        </div>
      ) : (
        <div className="card-surface overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead className="bg-slate-900/80 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Roles</th>
                <th className="px-4 py-3 font-medium hidden lg:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium hidden xl:table-cell">Last sign-in</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.uid} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">
                      {user.displayName || '—'}
                    </div>
                    <div className="text-xs text-slate-400">{user.email || 'No email'}</div>
                    <div className="text-xs text-slate-600 font-mono mt-0.5">{user.uid}</div>
                  </td>
                  <td className="px-4 py-3">
                    <RoleBadges user={user} />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-slate-400">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell text-slate-400">
                    {formatDate(user.lastSignIn)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`pill ${
                        user.disabled
                          ? 'border-red-800 text-red-300'
                          : 'border-emerald-700 text-emerald-300'
                      }`}
                    >
                      {user.disabled ? 'Disabled' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <AdminActions
                      viewHref={`/dashboard/users/${user.uid}`}
                      editHref={`/dashboard/users/${user.uid}/edit`}
                      onDelete={() => handleDelete(user)}
                      deleting={deletingUid === user.uid}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
