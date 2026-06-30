import Image from 'next/image';
import Link from 'next/link';

export type BlogListItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  thumbnailUrl: string;
  authorName: string;
  publishedAt: string | null;
};

function formatDate(iso: string | null) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}


export default function BlogCard({ blog }: { blog: BlogListItem }) {
  const summary = (blog.excerpt ?? '').trim();

  return (
    <Link
      href={`/dashboard/articles/${blog.id}`}
      className="card-surface group overflow-hidden rounded-2xl border border-slate-800 hover:border-slate-600 transition flex flex-col"
    >
      {blog.thumbnailUrl ? (
        <div className="relative aspect-[16/10] w-full bg-slate-900">
          <Image
            src={blog.thumbnailUrl}
            alt={blog.title}
            fill
            className="object-cover group-hover:scale-[1.02] transition duration-300"
            sizes="(max-width: 768px) 100vw, 33vw"
            unoptimized
          />
        </div>
      ) : (
        <div className="aspect-[16/10] w-full bg-slate-900/80 flex items-center justify-center text-slate-600 text-sm">
          No image
        </div>
      )}
      <div className="p-4 md:p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-base md:text-lg font-semibold text-slate-100 line-clamp-2 group-hover:text-accent transition">
          {blog.title}
        </h2>
        {summary ? (
          <p className="text-sm text-slate-400 line-clamp-3">{summary}</p>
        ) : null}
        <div className="mt-auto pt-2 flex items-center gap-3 text-xs text-slate-500">
          <span>{blog.authorName}</span>
          {blog.publishedAt ? <span>{formatDate(blog.publishedAt)}</span> : null}
        </div>
      </div>
    </Link>
  );
}
