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
  featured_video_url?: string;
  featured_audio_url?: string;
  meta?: {
    bmc_featured_video_url?: string;
    bmc_featured_audio_url?: string;
  };
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
    if (!post._embedded?.['wp:featuredmedia']?.[0]) return null;
    const media = post._embedded['wp:featuredmedia'][0];
    return (
      media.media_details?.sizes?.large?.source_url ||
      media.media_details?.sizes?.medium?.source_url ||
      media.source_url
    );
  }

  function getFeaturedVideoUrl(post: MediaPost): string | null {
    const url = post.featured_video_url ?? post.meta?.bmc_featured_video_url;
    return url && String(url).trim() ? String(url).trim() : null;
  }

  function getFeaturedAudioUrl(post: MediaPost): string | null {
    const url = post.featured_audio_url ?? post.meta?.bmc_featured_audio_url;
    return url && String(url).trim() ? String(url).trim() : null;
  }

  if (loading) {
    return (
      <div className="h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <div className="pill mb-2 h-6 w-32 animate-pulse bg-slate-800" />
            <div className="h-8 bg-slate-800 rounded w-64 mb-2 animate-pulse" />
            <div className="h-4 bg-slate-800 rounded w-48 animate-pulse" />
          </div>
          <LoadingSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-4 md:py-8">
      {/* Mobile: narrow feed (Instagram/WhatsApp style). Desktop: same wide grid as before */}
      <div className="max-w-[min(100%,420px)] md:max-w-7xl mx-auto">
        <header className="mb-6 md:mb-8">
          <div className="pill mb-2 inline-block">Feed</div>
          <h1 className="text-xl md:text-2xl font-bold mb-1 tracking-tight md:text-4xl md:mb-2">
            Latest News &amp; Articles
          </h1>
          <p className="text-slate-400 text-sm md:text-base max-w-2xl">
            Training content, insights, and updates for club members
          </p>
        </header>

        {posts.length === 0 && !loading ? (
          <div className="card-surface p-8 text-center space-y-4 rounded-2xl">
            <div className="pill mx-auto">Setup Required</div>
            <h2 className="text-lg font-semibold">WordPress Integration Pending</h2>
            <p className="text-slate-400 text-sm">
              Install and configure the WordPress plugin; content will appear here automatically.
            </p>
            <div className="mt-6 p-4 bg-slate-900/50 rounded-lg text-left text-xs text-slate-300">
              <p className="font-semibold mb-2">Next Steps:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                <li>Install WordPress plugin from <code className="bg-slate-800 px-1 rounded">wordpress-plugin/</code></li>
                <li>Configure BMC plugin settings</li>
                <li>Add env vars in Vercel</li>
              </ol>
            </div>
          </div>
        ) : (
          <>
            <section
              className="flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 lg:gap-6"
              aria-label="Media posts"
            >
              {posts.map((post) => (
                <MediaCard
                  key={post.id}
                  post={post}
                  featuredImage={getFeaturedImageUrl(post)}
                  featuredVideoUrl={getFeaturedVideoUrl(post)}
                  featuredAudioUrl={getFeaturedAudioUrl(post)}
                  userId={user.id}
                />
              ))}
            </section>

            {hasMore && (
              <div className="mt-6 md:mt-8 text-center">
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
