import { NextRequest, NextResponse } from 'next/server';
import { fetchWordPressPosts } from '@/lib/wordpress';
import { getSessionUser } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('per_page') || '12', 10);

    const { posts, totalPages } = await fetchWordPressPosts(page, perPage);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        perPage,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error: any) {
    console.error('Media fetch error:', error);
    
    // Check if WordPress API URL is not configured
    if (error.message?.includes('WordPress API URL not configured')) {
      return NextResponse.json(
        { 
          message: 'WordPress API not configured. Please set WORDPRESS_API_URL environment variable.',
          error: 'WORDPRESS_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: error.message || 'Failed to fetch media' },
      { status: 500 }
    );
  }
}
