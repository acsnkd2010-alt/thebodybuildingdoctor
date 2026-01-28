'use client';

import { useState, useEffect } from 'react';
import MediaCard from './MediaCard';

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

interface ProfileLikedFeedProps {
  user: {
    id: number;
    email: string;
    username?: string;
    name?: string;
  };
}

export default function ProfileLikedFeed({ user }: ProfileLikedFeedProps) {
  const [likedPosts, setLikedPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLikedPosts();
  }, []);

  async function loadLikedPosts() {
    try {
      setLoading(true);
      // Fetch all posts and filter for liked ones
      // In production, you might want a dedicated endpoint for liked posts
      const res = await fetch('/api/media?per_page=100');
      if (!res.ok) throw new Error('Failed to fetch media');

      const data = await res.json();
      const liked = data.posts.filter((post: MediaPost) => {
        const likedBy = post.acf?.liked_by || [];
        return likedBy.includes(user.id);
      });

      setLikedPosts(liked);
    } catch (error) {
      console.error('Error loading liked posts:', error);
    } finally {
      setLoading(false);
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
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-slate-400">Loading your liked content...</div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="pill w-fit mb-2">Your Profile</div>
          <h1 className="text-2xl md:text-3xl font-semibold mb-2">
            {user.name || user.username || 'Your'} Liked Content
          </h1>
          <p className="text-sm text-slate-400">
            Media you&apos;ve liked from the club channel
          </p>
        </div>

        {likedPosts.length === 0 ? (
          <div className="card-surface p-8 text-center">
            <p className="text-slate-400 mb-4">
              You haven&apos;t liked any content yet.
            </p>
            <a
              href="/dashboard"
              className="inline-flex items-center rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-slate-950 hover:bg-accent/90 transition"
            >
              Browse Media Channel
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {likedPosts.map((post) => (
              <MediaCard
                key={post.id}
                post={post}
                featuredImage={getFeaturedImageUrl(post)}
                userId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
