import { NextRequest, NextResponse } from 'next/server';

import {
  deleteBlogAccess,
  getBlogAccessAdmin,
  revokeBlogAccess,
  updateBlogAccess,
} from '@/lib/db/blog-access';
import { requireAdminApi } from '@/lib/auth/require-admin';

export async function GET(
  _request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  try {
    const blogAccess = await getBlogAccessAdmin(params.uid);
    if (!blogAccess) {
      return NextResponse.json({ message: 'Blog access not found' }, { status: 404 });
    }
    return NextResponse.json({ blogAccess });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blog access';
    return NextResponse.json({ message }, { status: 500 });
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
    const updates: Record<string, unknown> = {};
    if (body.status === 'active' || body.status === 'revoked') updates.status = body.status;
    if (typeof body.note === 'string') updates.note = body.note;

    const blogAccess = await updateBlogAccess(params.uid, updates);
    if (!blogAccess) {
      return NextResponse.json({ message: 'Blog access not found' }, { status: 404 });
    }
    return NextResponse.json({ blogAccess });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { uid: string } },
) {
  const auth = await requireAdminApi();
  if (auth.error) return auth.error;

  const hard = request.nextUrl.searchParams.get('hard') === 'true';

  try {
    if (hard) {
      await deleteBlogAccess(params.uid);
    } else {
      await revokeBlogAccess(params.uid);
    }
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}
