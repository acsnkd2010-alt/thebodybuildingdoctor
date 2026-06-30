import { NextRequest, NextResponse } from 'next/server';

import {
  deleteBlogAccess,
  grantBlogAccess,
  listBlogAccess,
  revokeBlogAccess,
} from '@/lib/db/blog-access';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const status = request.nextUrl.searchParams.get('status');
    const blogAccess = await listBlogAccess(
      status === 'active' || status === 'revoked' ? { status } : undefined,
    );
    return NextResponse.json({ blogAccess });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const uid = typeof body.uid === 'string' ? body.uid.trim() : '';

    if (!uid) {
      return NextResponse.json({ message: 'uid is required' }, { status: 400 });
    }

    const status =
      body.status === 'active' || body.status === 'revoked' ? body.status : 'active';
    const note = typeof body.note === 'string' ? body.note : undefined;

    const access = await grantBlogAccess(uid, { status, note });
    return NextResponse.json({ blogAccess: access }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to grant blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const uid = request.nextUrl.searchParams.get('uid');
  const hard = request.nextUrl.searchParams.get('hard') === 'true';

  if (!uid) {
    return NextResponse.json({ message: 'uid is required' }, { status: 400 });
  }

  try {
    if (hard) {
      await deleteBlogAccess(uid);
    } else {
      await revokeBlogAccess(uid);
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}
