import Link from 'next/link';

import BlogCard, { type BlogListItem } from '@/components/BlogCard';

type BlogFeedProps = {
  blogs: BlogListItem[];
  isAdmin: boolean;
  loadError?: string | null;
};

export default function BlogFeed({ blogs, isAdmin, loadError }: BlogFeedProps) {
  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-4 md:py-8">
      <div className="max-w-[min(100%,420px)] md:max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="pill mb-2 inline-block">News</div>
          <h1 className="text-xl md:text-2xl font-bold mb-1 tracking-tight md:text-4xl md:mb-2">
            Latest News &amp; Articles
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Training content, insights, and updates for club members
          </p>
        </header>

        {loadError ? (
          <div className="card-surface p-8 text-center space-y-4 rounded-2xl border border-red-900/40">
            <div className="pill mx-auto border-red-800 text-red-300">Unable to load articles</div>
            <p className="text-slate-400 text-sm max-w-md mx-auto">{loadError}</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="card-surface p-8 text-center space-y-4 rounded-2xl">
            <div className="pill mx-auto">No articles yet</div>
            <h2 className="text-lg font-semibold">Published articles will appear here</h2>
            <p className="text-slate-400 text-sm max-w-md mx-auto">
              Create and publish blog posts in the admin area. Members with blog access will see
              them in the mobile app.
            </p>
            {isAdmin && (
              <Link
                href="/dashboard/blogs/new"
                className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
              >
                Create first article
              </Link>
            )}
          </div>
        ) : (
          <section
            className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
            aria-label="News and articles"
          >
            {blogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </section>
        )}
      </div>
    </div>
  );
}
