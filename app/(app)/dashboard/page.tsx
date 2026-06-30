import BlogFeed from '@/components/BlogFeed';
import { listPublishedBlogs } from '@/lib/db/blogs';
import { getSessionUser } from '@/lib/auth/session';
import { isAdmin } from '@/lib/auth/roles';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-10">
        <div className="card-surface max-w-lg w-full p-6 md:p-8 text-center space-y-4">
          <div className="pill mx-auto">Members Only</div>
          <h1 className="text-2xl font-semibold">Login to view news &amp; articles</h1>
          <p className="text-sm text-slate-400">
            Sign in to read training content, insights, and updates for club members.
          </p>
          <Link
            href="/login"
            className="inline-flex rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
          >
            Log in
          </Link>
        </div>
      </div>
    );
  }

  let blogs: Awaited<ReturnType<typeof listPublishedBlogs>> = [];
  let loadError: string | null = null;

  try {
    blogs = await listPublishedBlogs();
  } catch (error) {
    console.error('Dashboard: failed to load blogs', error);
    loadError =
      error instanceof Error ? error.message : 'Could not load articles from the database.';
  }

  const admin = isAdmin(user.roles);

  return (
    <div>
      {admin && (
        <div className="px-4 pt-4 md:px-8">
          <div className="card-surface max-w-7xl mx-auto p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-100">Admin quick links</p>
              <p className="text-xs text-slate-400">
                Manage courses, users, enrollments, and blog articles.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <Link
                href="/dashboard/blogs/new"
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
              >
                New article
              </Link>
              <Link
                href="/dashboard/courses"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Courses
              </Link>
              <Link
                href="/dashboard/users"
                className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800"
              >
                Users
              </Link>
            </div>
          </div>
        </div>
      )}
      <BlogFeed blogs={blogs} isAdmin={admin} loadError={loadError} />
    </div>
  );
}
