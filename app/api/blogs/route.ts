import { NextResponse } from 'next/server';

import { hasBlogAccess } from '@/lib/db/blog-access';
import { listPublishedBlogs } from '@/lib/db/blogs';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(request: Request) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const allowed = await hasBlogAccess(decoded.uid, decoded.roles);
    if (!allowed) {
      return NextResponse.json(
        { message: 'You do not have access to blogs. Contact an administrator.' },
        { status: 403 },
      );
    }

    const blogs = await listPublishedBlogs();
    return NextResponse.json({ blogs });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blogs';
    return NextResponse.json({ message }, { status: 500 });
  }
}
