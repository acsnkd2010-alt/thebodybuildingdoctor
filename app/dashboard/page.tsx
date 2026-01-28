import MediaFeed from '@/components/MediaFeed';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-10">
        <div className="card-surface max-w-lg w-full p-6 md:p-8 text-center space-y-4">
          <div className="pill mx-auto">Members Only</div>
          <h1 className="text-2xl font-semibold">Login to view the media channel</h1>
          <p className="text-sm text-slate-400">
            This dashboard is restricted to authenticated club members. Please log in to
            access training videos, posing breakdowns, and more.
          </p>
        </div>
      </div>
    );
  }

  return <MediaFeed user={user} />;
}

