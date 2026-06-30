import { NextRequest, NextResponse } from 'next/server';
import type { UserRecord } from 'firebase-admin/auth';

import { getMongoDb } from '@/lib/mongodb';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { serializeAdminUser, type UserProfile } from '@/lib/admin/serialize-user';
import { requireAdminApi } from '@/lib/auth/require-admin';

async function listAllFirebaseUsers() {
  const auth = await getFirebaseAdminAuth();
  const users: UserRecord[] = [];
  let pageToken: string | undefined;

  do {
    const result = await auth.listUsers(1000, pageToken);
    users.push(...result.users);
    pageToken = result.pageToken;
  } while (pageToken);

  return users;
}

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const email = request.nextUrl.searchParams.get('email')?.trim().toLowerCase();
    const uid = request.nextUrl.searchParams.get('uid')?.trim();
    const query = request.nextUrl.searchParams.get('q')?.trim().toLowerCase();

    const db = await getMongoDb();

    if (email) {
      const fbUser = await (await getFirebaseAdminAuth()).getUserByEmail(email);
      const profile = await db.collection<UserProfile>('users').findOne({ _id: fbUser.uid as never });
      return NextResponse.json({ users: [serializeAdminUser(fbUser, profile)] });
    }

    if (uid) {
      const fbUser = await (await getFirebaseAdminAuth()).getUser(uid);
      const profile = await db.collection<UserProfile>('users').findOne({ _id: uid as never });
      return NextResponse.json({ users: [serializeAdminUser(fbUser, profile)] });
    }

    const [firebaseUsers, profileDocs] = await Promise.all([
      listAllFirebaseUsers(),
      db.collection<UserProfile>('users').find().toArray(),
    ]);

    const profileMap = new Map(
      profileDocs.map((doc) => [String(doc._id), doc as UserProfile]),
    );

    let users = firebaseUsers.map((fbUser) =>
      serializeAdminUser(fbUser, profileMap.get(fbUser.uid)),
    );

    if (query) {
      users = users.filter(
        (user) =>
          user.email.toLowerCase().includes(query) ||
          user.displayName.toLowerCase().includes(query) ||
          user.uid.toLowerCase().includes(query),
      );
    }

    users.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return NextResponse.json({ users, total: users.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load users';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body.password === 'string' ? body.password : '';
    const displayName = typeof body.displayName === 'string' ? body.displayName.trim() : '';
    const roles = Array.isArray(body.roles) ? body.roles.map(String) : [];
    const role = typeof body.role === 'string' ? body.role : 'student';

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const adminAuth = await getFirebaseAdminAuth();
    const fbUser = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || undefined,
    });

    if (roles.length > 0) {
      await adminAuth.setCustomUserClaims(fbUser.uid, { roles });
    }

    const db = await getMongoDb();
    await db.collection('users').updateOne(
      { _id: fbUser.uid as never },
      {
        $set: {
          email,
          displayName,
          role,
          updatedAt: new Date(),
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    const created = await adminAuth.getUser(fbUser.uid);
    const profile = await db.collection<UserProfile>('users').findOne({ _id: fbUser.uid as never });
    return NextResponse.json(serializeAdminUser(created, profile), { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user';
    return NextResponse.json({ message }, { status: 500 });
  }
}
