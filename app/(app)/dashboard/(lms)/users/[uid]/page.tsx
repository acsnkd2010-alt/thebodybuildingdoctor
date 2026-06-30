import { notFound } from 'next/navigation';

import UserView from '@/components/admin/UserView';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { getMongoDb } from '@/lib/mongodb';
import { serializeAdminUser, type UserProfile } from '@/lib/admin/serialize-user';

export const dynamic = 'force-dynamic';

export default async function ViewUserPage({ params }: { params: { uid: string } }) {
  try {
    const fbUser = await (await getFirebaseAdminAuth()).getUser(params.uid);
    const db = await getMongoDb();
    const profile = await db.collection<UserProfile>('users').findOne({ _id: params.uid as never });
    const user = serializeAdminUser(fbUser, profile);
    return <UserView user={user} />;
  } catch {
    notFound();
  }
}
