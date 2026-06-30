import Link from 'next/link';
import Image from 'next/image';

import AdminPageHeader from '@/components/admin/AdminPageHeader';

type BlogArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  contentHtml: string;
  thumbnailUrl: string;
  authorName: string;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default function BlogArticleView({ blog }: { blog: BlogArticle }) {
  return (
    <div className="min-h-full overflow-y-auto px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <AdminPageHeader
          backHref="/dashboard"
          backLabel="Back to news"
          title={blog.title}
          editHref={`/dashboard/blogs/${blog.id}/edit`}
        />

        {blog.thumbnailUrl && (
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden border border-slate-800">
            <Image
              src={blog.thumbnailUrl}
              alt={blog.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 768px"
              unoptimized
            />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-400">
          <span>{blog.authorName}</span>
          {blog.publishedAt ? <span>{formatDate(blog.publishedAt)}</span> : null}
        </div>

        {blog.excerpt ? (
          <p className="text-lg text-slate-300 leading-relaxed italic border-l-2 border-accent pl-4">
            {blog.excerpt}
          </p>
        ) : null}

        {blog.contentHtml ? (
          <article
            className="prose prose-invert prose-lg max-w-none prose-headings:text-slate-100 prose-a:text-accent"
            dangerouslySetInnerHTML={{ __html: blog.contentHtml }}
          />
        ) : (
          <p className="text-slate-500">This article has no body content yet.</p>
        )}

        <div className="pt-4 border-t border-slate-800">
          <Link href="/dashboard" className="text-sm text-accent hover:underline">
            ← All news &amp; articles
          </Link>
        </div>
      </div>
    </div>
  );
}
