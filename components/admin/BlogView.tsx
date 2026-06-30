'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import AdminPageHeader from '@/components/admin/AdminPageHeader';
import { deleteBlog, type Blog } from '@/lib/admin-api';

export default function BlogView({ blog }: { blog: Blog }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`Delete "${blog.title}"?`)) return;
    setDeleting(true);
    try {
      await deleteBlog(blog.id);
      router.push('/dashboard/blogs');
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete blog');
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        backHref="/dashboard/blogs"
        backLabel="Back to blogs"
        title={blog.title}
        editHref={`/dashboard/blogs/${blog.id}/edit`}
        onDelete={handleDelete}
        deleting={deleting}
      />

      {blog.thumbnailUrl && (
        <img
          src={blog.thumbnailUrl}
          alt={blog.title}
          className="w-full max-h-64 object-cover rounded-2xl border border-slate-800"
        />
      )}

      <div className="card-surface p-6 grid gap-4 md:grid-cols-2 text-sm">
        <div>
          <div className="text-xs text-slate-500 mb-1">Slug</div>
          <div className="text-slate-200">{blog.slug}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Author</div>
          <div className="text-slate-200">{blog.authorName}</div>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <span
            className={`pill ${blog.published ? 'border-emerald-700 text-emerald-300' : 'border-amber-700 text-amber-300'}`}
          >
            {blog.published ? 'Published' : 'Draft'}
          </span>
        </div>
        <div>
          <div className="text-xs text-slate-500 mb-1">Published at</div>
          <div className="text-slate-200">
            {blog.publishedAt ? new Date(blog.publishedAt).toLocaleString() : '—'}
          </div>
        </div>
        {blog.excerpt && (
          <div className="md:col-span-2">
            <div className="text-xs text-slate-500 mb-1">Excerpt</div>
            <div className="text-slate-300">{blog.excerpt}</div>
          </div>
        )}
      </div>

      {blog.contentHtml && (
        <div className="card-surface p-6">
          <div className="text-xs text-slate-500 mb-3">Content preview</div>
          <div
            className="prose prose-invert prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />
        </div>
      )}
    </div>
  );
}
