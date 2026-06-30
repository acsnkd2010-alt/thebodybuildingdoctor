import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeftIcon } from '@heroicons/react/24/outline';

import UserForm from '@/components/admin/UserForm';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { getMongoDb } from '@/lib/mongodb';
import { serializeAdminUser, type UserProfile } from '@/lib/admin/serialize-user';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: { uid: string } }) {
  try {
    const fbUser = await (await getFirebaseAdminAuth()).getUser(params.uid);
    const db = await getMongoDb();
    const profile = await db.collection<UserProfile>('users').findOne({ _id: params.uid as never });
    const user = serializeAdminUser(fbUser, profile);

    return (
      <div className="space-y-6">
        <Link
          href={`/dashboard/users/${params.uid}`}
          className="inline-flex items-center gap-1 text-sm text-slate-400 hover:text-slate-200"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Back to user
        </Link>
        <UserForm user={user} />
      </div>
    );
  } catch {
    notFound();
  }
}
