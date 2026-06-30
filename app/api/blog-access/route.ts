import { NextResponse } from 'next/server';

import { resolveBlogAccess } from '@/lib/db/blog-access';
import { verifyBearerToken } from '@/lib/auth/verify-firebase-token';

export async function GET(request: Request) {
  const decoded = await verifyBearerToken(request);
  if (!decoded) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { hasAccess, blogAccess } = await resolveBlogAccess(decoded.uid, decoded.roles);
    return NextResponse.json({
      hasAccess,
      blogAccess,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to check blog access';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function POST() {
  return NextResponse.json(
    { message: 'Blog access is managed by an administrator. Please contact your coach.' },
    { status: 403 },
  );
}
