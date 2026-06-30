'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

import {
  deleteBlog,
  fetchBlogs,
  type Blog,
} from '@/lib/admin-api';
import AdminActions from '@/components/admin/AdminActions';

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBlogs();
      setBlogs(data.blogs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load blogs');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(blog: Blog) {
    if (!confirm(`Delete "${blog.title}"?`)) return;
    setDeletingId(blog.id);
    try {
      await deleteBlog(blog.id);
      setBlogs((prev) => prev.filter((item) => item.id !== blog.id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return <div className="text-sm text-slate-400">Loading blogs…</div>;
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
        <p className="text-sm text-slate-400">{blogs.length} blog{blogs.length === 1 ? '' : 's'}</p>
        <Link
          href="/dashboard/blogs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
        >
          <PlusIcon className="w-4 h-4" />
          New blog
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="card-surface p-8 text-center text-slate-400">
          No blogs yet. Create your first article for the mobile app.
        </div>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-900/80 text-slate-400 text-left">
              <tr>
                <th className="px-4 py-3 font-medium">Blog</th>
                <th className="px-4 py-3 font-medium hidden md:table-cell">Author</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {blogs.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-900/40">
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-100">{blog.title}</div>
                    <div className="text-xs text-slate-500">{blog.slug}</div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell text-slate-300">
                    {blog.authorName}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`pill ${blog.published ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
                    >
                      {blog.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <AdminActions
                      viewHref={`/dashboard/blogs/${blog.id}`}
                      editHref={`/dashboard/blogs/${blog.id}/edit`}
                      onDelete={() => handleDelete(blog)}
                      deleting={deletingId === blog.id}
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
