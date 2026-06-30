import { NextRequest, NextResponse } from 'next/server';

import { getMongoDb } from '@/lib/mongodb';
import { getFirebaseAdminAuth } from '@/lib/firebase/admin';
import { serializeAdminUser, type UserProfile } from '@/lib/admin/serialize-user';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const fbUser = await (await getFirebaseAdminAuth()).getUser(params.uid);
    const db = await getMongoDb();
    const profile = await db.collection<UserProfile>('users').findOne({ _id: params.uid as never });
    return NextResponse.json(serializeAdminUser(fbUser, profile));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'User not found';
    return NextResponse.json({ message }, { status: 404 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const adminAuth = await getFirebaseAdminAuth();
    const existing = await adminAuth.getUser(params.uid);

    const updates: {
      email?: string;
      displayName?: string;
      password?: string;
      disabled?: boolean;
    } = {};

    if (typeof body.email === 'string' && body.email.trim()) {
      updates.email = body.email.trim();
    }
    if (typeof body.displayName === 'string') {
      updates.displayName = body.displayName.trim();
    }
    if (typeof body.password === 'string' && body.password) {
      if (body.password.length < 6) {
        return NextResponse.json({ message: 'Password must be at least 6 characters' }, { status: 400 });
      }
      updates.password = body.password;
    }
    if (typeof body.disabled === 'boolean') {
      updates.disabled = body.disabled;
    }

    if (Object.keys(updates).length > 0) {
      await adminAuth.updateUser(params.uid, updates);
    }

    if (Array.isArray(body.roles)) {
      const roles = body.roles.map(String).filter(Boolean);
      const existingClaims = existing.customClaims ?? {};
      await adminAuth.setCustomUserClaims(params.uid, { ...existingClaims, roles });
    }

    const db = await getMongoDb();
    const profileUpdates: Record<string, unknown> = { updatedAt: new Date() };
    if (typeof body.role === 'string') profileUpdates.role = body.role;
    if (typeof body.displayName === 'string') profileUpdates.displayName = body.displayName.trim();
    if (typeof body.email === 'string') profileUpdates.email = body.email.trim();

    await db.collection('users').updateOne(
      { _id: params.uid as never },
      {
        $set: profileUpdates,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );

    const fbUser = await adminAuth.getUser(params.uid);
    const profile = await db.collection<UserProfile>('users').findOne({ _id: params.uid as never });
    return NextResponse.json(serializeAdminUser(fbUser, profile));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  if (auth.user?.uid === params.uid) {
    return NextResponse.json({ message: 'You cannot delete your own account' }, { status: 400 });
  }

  try {
    await (await getFirebaseAdminAuth()).deleteUser(params.uid);
    const db = await getMongoDb();
    await db.collection('users').deleteOne({ _id: params.uid as never });
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user';
    return NextResponse.json({ message }, { status: 500 });
  }
}
