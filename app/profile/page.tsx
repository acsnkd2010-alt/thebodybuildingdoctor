import { getSessionUser } from '../../lib/auth/session';
import ProfileLikedFeed from '../../components/ProfileLikedFeed';

export const dynamic = 'force-dynamic';

export default async function ProfilePage() {
  const user = await getSessionUser();

  if (!user) {
    return (
      <div className="flex h-full items-center justify-center px-4 py-10">
        <div className="card-surface max-w-lg w-full p-6 md:p-8 text-center space-y-4">
          <div className="pill mx-auto">Members Only</div>
          <h1 className="text-2xl font-semibold">Login to view your profile</h1>
          <p className="text-sm text-slate-400">
            Your liked content and saved media is available once you are logged in.
          </p>
        </div>
      </div>
    );
  }

  return <ProfileLikedFeed user={user} />;
}

