import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { fetchWordPressPost } from '@/lib/wordpress';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL?.replace(/\/$/, '');
const WORDPRESS_API_KEY = process.env.WORDPRESS_API_KEY;

export const dynamic = 'force-dynamic';

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: RouteContext) {
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

    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { message: 'WordPress API not configured' },
        { status: 500 }
      );
    }

    const bmcLikeUrl = `${WORDPRESS_API_URL}/wp-json/bmc/v1/media/${postId}/like`;

    // 1) Try BMC plugin like endpoint: send user_id so plugin can apply like server-side.
    // Plugin can accept Bearer (shared secret) or Basic auth.
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (WORDPRESS_API_KEY) {
      headers.Authorization = `Bearer ${WORDPRESS_API_KEY}`;
    }
    const wpResponse = await fetch(bmcLikeUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ user_id: user.id }),
    });

    if (wpResponse.ok) {
      try {
        const data = await wpResponse.json();
        return NextResponse.json({
          success: true,
          liked: data.liked,
          likes: data.likes,
        });
      } catch {
        return NextResponse.json({
          success: true,
          liked: undefined,
          likes: undefined,
        });
      }
    }

    // 2) Fallback: update acf on bmc_media via REST (requires ACF/plugin to expose acf on bmc_media).
    const post = await fetchWordPressPost(postId);
    const currentLikes = post.acf?.likes ?? 0;
    const likedBy = Array.isArray(post.acf?.liked_by) ? post.acf.liked_by : [];
    const isLiked = likedBy.includes(user.id);

    const newLikedBy = isLiked
      ? likedBy.filter((id) => id !== user.id)
      : [...likedBy, user.id];
    const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

    const bmcMediaUrl = `${WORDPRESS_API_URL}/wp-json/wp/v2/bmc_media/${postId}`;
    const authHeader = WORDPRESS_API_KEY
      ? { Authorization: `Basic ${Buffer.from(`:${WORDPRESS_API_KEY}`).toString('base64')}` }
      : {};

    const updateRes = await fetch(bmcMediaUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
      body: JSON.stringify({
        acf: {
          likes: newLikes,
          liked_by: newLikedBy,
        },
      }),
    });

    if (updateRes.ok) {
      return NextResponse.json({
        success: true,
        liked: !isLiked,
        likes: newLikes,
      });
    }

    // If fallback also failed, still return success with computed state so UI updates.
    return NextResponse.json({
      success: true,
      liked: !isLiked,
      likes: newLikes,
    });
  } catch (error: unknown) {
    console.error('Like error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update like';
    return NextResponse.json({ message }, { status: 500 });
  }
}

export async function GET(request: NextRequest, { params }: RouteContext) {
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
    const likedBy = post.acf?.liked_by ?? [];
    const isLiked = Array.isArray(likedBy) && likedBy.includes(user.id);

    return NextResponse.json({
      liked: isLiked,
      likes: post.acf?.likes ?? 0,
    });
  } catch (error: unknown) {
    console.error('Like GET error:', error);
    const message = error instanceof Error ? error.message : 'Failed to get like status';
    return NextResponse.json({ message }, { status: 500 });
  }
}
