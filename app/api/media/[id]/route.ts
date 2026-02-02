import { NextRequest, NextResponse } from 'next/server';
import { fetchWordPressPost } from '../../../../lib/wordpress';
import { getSessionUser } from '../../../../lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const postId = parseInt(id, 10);
    if (isNaN(postId)) {
      return NextResponse.json({ message: 'Invalid post ID' }, { status: 400 });
    }

    const post = await fetchWordPressPost(postId);
    return NextResponse.json({ post });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch post';
    if (message.includes('WordPress API URL not configured')) {
      return NextResponse.json(
        { message: 'WordPress not configured', error: 'WORDPRESS_NOT_CONFIGURED' },
        { status: 503 }
      );
    }
    if (message.includes('404') || message.includes('not found')) {
      return NextResponse.json({ message: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json({ message }, { status: 500 });
  }
}
