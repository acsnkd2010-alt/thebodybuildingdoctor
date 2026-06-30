'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { createBlog, updateBlog, type Blog } from '@/lib/admin-api';
import ThumbnailUpload from '@/components/admin/ThumbnailUpload';

type BlogFormProps = {
  blog?: Blog;
};

const inputClass =
  'w-full rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-accent focus:outline-none';
const labelClass = 'block text-xs font-medium text-slate-400 mb-1.5';

export default function BlogForm({ blog }: BlogFormProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState(blog?.title ?? '');
  const [slug, setSlug] = useState(blog?.slug ?? '');
  const [excerpt, setExcerpt] = useState(blog?.excerpt ?? '');
  const [contentHtml, setContentHtml] = useState(blog?.contentHtml ?? '');
  const [thumbnailUrl, setThumbnailUrl] = useState(blog?.thumbnailUrl ?? '');
  const [authorName, setAuthorName] = useState(
    blog?.authorName ?? 'The Bodybuilding Doctor',
  );
  const [published, setPublished] = useState(blog?.published ?? false);
  const [order, setOrder] = useState(blog?.order ?? 0);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      title,
      slug,
      excerpt,
      contentHtml,
      thumbnailUrl,
      authorName,
      published,
      order,
    };

    try {
      if (blog) {
        await updateBlog(blog.id, payload);
        router.push(`/dashboard/blogs/${blog.id}`);
        router.refresh();
      } else {
        const created = await createBlog(payload);
        router.push(`/dashboard/blogs/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blog');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card-surface p-6 space-y-5">
      {error && (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Title</label>
          <input
            className={inputClass}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Slug</label>
          <input
            className={inputClass}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="auto-generated from title if empty"
          />
        </div>

        <div>
          <label className={labelClass}>Author</label>
          <input className={inputClass} value={authorName} onChange={(e) => setAuthorName(e.target.value)} />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Excerpt</label>
          <textarea
            className={`${inputClass} min-h-[80px]`}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Short summary shown in the blog list"
          />
        </div>

        <div className="md:col-span-2">
          <ThumbnailUpload value={thumbnailUrl} onChange={setThumbnailUrl} folder="blogs" />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Content (HTML)</label>
          <textarea
            className={`${inputClass} min-h-[240px] font-mono text-xs`}
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            placeholder="<p>Article body...</p>"
          />
        </div>

        <div>
          <label className={labelClass}>Sort order</label>
          <input
            type="number"
            className={inputClass}
            value={order}
            onChange={(e) => setOrder(Number(e.target.value))}
          />
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-slate-600"
            />
            Published (visible in app for users with blog access)
          </label>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving…' : blog ? 'Save changes' : 'Create blog'}
        </button>
      </div>
    </form>
  );
}
