'use client';

import { useState, useEffect } from 'react';
import MediaCard from './MediaCard';
import LoadingSkeleton from './LoadingSkeleton';

interface MediaPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
  };
  acf?: {
    likes?: number;
    liked_by?: number[];
  };
}

interface MediaFeedProps {
  user: {
    id: number;
    email: string;
    username?: string;
  };
}

export default function MediaFeed({ user }: MediaFeedProps) {
  const [posts, setPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadPosts(1);
  }, []);

  async function loadPosts(pageNum: number, append = false) {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await fetch(`/api/media?page=${pageNum}&per_page=12`);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        if (errorData.error === 'WORDPRESS_NOT_CONFIGURED') {
          throw new Error('WORDPRESS_NOT_CONFIGURED');
        }
        throw new Error(errorData.message || 'Failed to fetch media');
      }

      const data = await res.json();
      
      if (append) {
        setPosts((prev) => [...prev, ...data.posts]);
      } else {
        setPosts(data.posts);
      }

      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (error: any) {
      console.error('Error loading posts:', error);
      if (error.message === 'WORDPRESS_NOT_CONFIGURED') {
        // Don't show error, just show empty state with message
        setPosts([]);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  function handleLoadMore() {
    if (!loadingMore && hasMore) {
      loadPosts(page + 1, true);
    }
  }

  function getFeaturedImageUrl(post: MediaPost): string | null {
    if (!post._embedded?.['wp:featuredmedia']?.[0]) {
      return null;
    }
    const media = post._embedded['wp:featuredmedia'][0];
    return (
      media.media_details?.sizes?.large?.source_url ||
      media.media_details?.sizes?.medium?.source_url ||
      media.source_url
    );
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="pill w-fit mb-2 animate-pulse bg-slate-800 h-6 w-32" />
            <div className="h-8 bg-slate-800 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded w-48 animate-pulse" />
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="pill w-fit mb-2">Media Channel</div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            Training Content &amp; Insights
          </h1>
          <p className="text-sm text-slate-400">
            Exclusive bodybuilding content for club members
          </p>
        </div>

        {posts.length === 0 && !loading ? (
          <div className="card-surface p-8 text-center space-y-4">
            <div className="pill mx-auto">Setup Required</div>
            <h2 className="text-xl font-semibold">WordPress Integration Pending</h2>
            <p className="text-slate-400 text-sm">
              The media channel is ready! Once you install and configure the WordPress plugin,
              your content will appear here automatically.
            </p>
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg text-left text-xs text-slate-300">
              <p className="font-semibold mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Install WordPress plugin from <code className="bg-slate-800 px-1 rounded">wordpress-plugin/</code> folder</li>
                <li>Configure WordPress plugin settings</li>
                <li>Add environment variables in Vercel Dashboard</li>
                <li>Content will appear automatically!</li>
              </ol>
            </div>
          </div>
        ) : posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {posts.map((post) => (
                <MediaCard
                  key={post.id}
                  post={post}
                  featuredImage={getFeaturedImageUrl(post)}
                  userId={user.id}
                />
              ))}
            </div>

            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/80 px-6 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/80 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore ? (
                    <>
                      <span className="animate-spin">⏳</span>
                      Loading...
                    </>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
