import { NextResponse } from 'next/server';

import { getMongoDb } from '@/lib/mongodb';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(request: Request) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = await getMongoDb();
    const profile = await db.collection('users').findOne({ _id: decoded.uid as never });
    if (!profile) {
      return NextResponse.json(
        { message: 'Account not provisioned. Contact your administrator.' },
        { status: 403 },
      );
    }

    let fbUser = null;
    try {
      fbUser = await (await getFirebaseAdminAuth()).getUser(decoded.uid);
    } catch {
      // optional
    }

    return NextResponse.json({
      uid: decoded.uid,
      email: fbUser?.email ?? decoded.email ?? profile?.email ?? '',
      displayName: fbUser?.displayName ?? profile?.displayName ?? '',
      role: profile?.role ?? 'student',
      createdAt: profile?.createdAt?.toISOString?.() ?? fbUser?.metadata?.creationTime ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load profile';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const displayName =
      typeof body.displayName === 'string' ? body.displayName.trim() : undefined;

    if (displayName !== undefined) {
      const db = await getMongoDb();
      const profile = await db.collection('users').findOne({ _id: decoded.uid as never });
      if (!profile) {
        return NextResponse.json(
          { message: 'Account not provisioned. Contact your administrator.' },
          { status: 403 },
        );
      }

      await (await getFirebaseAdminAuth()).updateUser(decoded.uid, { displayName });
      await db.collection('users').updateOne(
        { _id: decoded.uid as never },
        { $set: { displayName, updatedAt: new Date() } },
      );
    }

    const db = await getMongoDb();
    const profile = await db.collection('users').findOne({ _id: decoded.uid as never });
    if (!profile) {
      return NextResponse.json(
        { message: 'Account not provisioned. Contact your administrator.' },
        { status: 403 },
      );
    }
    const fbUser = await (await getFirebaseAdminAuth()).getUser(decoded.uid);

    return NextResponse.json({
      uid: decoded.uid,
      email: fbUser.email ?? decoded.email ?? '',
      displayName: fbUser.displayName ?? profile?.displayName ?? '',
      role: profile?.role ?? 'student',
      createdAt: profile?.createdAt?.toISOString?.() ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update profile';
    return NextResponse.json({ message }, { status: 500 });
  }
}
