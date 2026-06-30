import { NextRequest, NextResponse } from 'next/server';

import { hasBlogAccess } from '@/lib/db/blog-access';
import { getBlogById } from '@/lib/db/blogs';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const blog = await getBlogById(params.id);
    if (!blog || !blog.published) {
      return NextResponse.json({ message: 'Blog not found' }, { status: 404 });
    }

    return NextResponse.json({ blog });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to load blog';
    return NextResponse.json({ message }, { status: 500 });
  }
}
