import { NextRequest, NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth/session';
import { fetchWordPressPost } from '@/lib/wordpress';

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = parseInt(params.id, 10);
    if (isNaN(postId)) {
      return NextResponse.json(
        { message: 'Invalid post ID' },
        { status: 400 }
      );
    }

    // Use WordPress plugin's custom endpoint for likes
    if (!WORDPRESS_API_URL || !process.env.WORDPRESS_API_KEY) {
      return NextResponse.json(
        { message: 'WordPress API not configured' },
        { status: 500 }
      );
    }

    // Call WordPress plugin's like endpoint
    // First, we need to authenticate the WordPress user
    // The plugin endpoint expects WordPress user authentication
    // We'll use the Application Password to authenticate
    try {
      const wpResponse = await fetch(
        `${WORDPRESS_API_URL}/wp-json/bmc/v1/posts/${postId}/like`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${Buffer.from(
              `${user.email}:${process.env.WORDPRESS_API_KEY}`
            ).toString('base64')}`,
          },
        }
      );

      if (!wpResponse.ok) {
        // Fallback: try updating via standard REST API with acf field
        const post = await fetchWordPressPost(postId);
        const currentLikes = post.acf?.likes || 0;
        const likedBy = post.acf?.liked_by || [];
        const isLiked = Array.isArray(likedBy) && likedBy.includes(user.id);
        
        const newLikedBy = isLiked
          ? likedBy.filter((id: number) => id !== user.id)
          : [...likedBy, user.id];
        const newLikes = isLiked ? currentLikes - 1 : currentLikes + 1;

        // Update via standard REST API
        await fetch(
          `${WORDPRESS_API_URL}/wp-json/wp/v2/posts/${postId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Basic ${Buffer.from(
                `:${process.env.WORDPRESS_API_KEY}`
              ).toString('base64')}`,
            },
            body: JSON.stringify({
              acf: {
                likes: newLikes,
                liked_by: newLikedBy,
              },
            }),
          }
        );

        return NextResponse.json({
          success: true,
          liked: !isLiked,
          likes: newLikes,
        });
      }

      const data = await wpResponse.json();
      return NextResponse.json({
        success: true,
        liked: data.liked,
        likes: data.likes,
      });
    } catch (error) {
      console.error('WordPress like error:', error);
      throw error;
    }
  } catch (error: any) {
    console.error('Like error:', error);
    return NextResponse.json(
      { message: error.message || 'Failed to update like' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const postId = parseInt(params.id, 10);
    const post = await fetchWordPressPost(postId);
    
    const likedBy = post.acf?.liked_by || [];
    const isLiked = likedBy.includes(user.id);
    
    return NextResponse.json({
      liked: isLiked,
      likes: post.acf?.likes || 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message || 'Failed to check like status' },
      { status: 500 }
    );
  }
}
