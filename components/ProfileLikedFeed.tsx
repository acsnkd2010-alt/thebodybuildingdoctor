'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import MediaCard from './MediaCard';

interface MediaPost {
  id: number;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_media: number;
  featured_video_url?: string;
  featured_audio_url?: string;
  meta?: { bmc_featured_video_url?: string; bmc_featured_audio_url?: string };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: { medium?: { source_url: string }; large?: { source_url: string }; full?: { source_url: string } };
      };
    }>;
  };
  acf?: { likes?: number; liked_by?: number[] };
}

interface ProfileLikedFeedProps {
  user: {
    id: number;
    email: string;
    username?: string;
    name?: string;
  };
}

interface ProfileDetails {
  name?: string;
  profile_picture_url?: string;
  phone?: string;
  date_of_birth?: string;
}

export default function ProfileLikedFeed({ user }: ProfileLikedFeedProps) {
  const [likedPosts, setLikedPosts] = useState<MediaPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileDetails | null>(null);

  useEffect(() => {
    loadLikedPosts();
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) {
          setProfile({
            name: data.user.name ?? data.user.username,
            profile_picture_url: data.user.profile_picture_url,
            phone: data.user.phone,
            date_of_birth: data.user.date_of_birth,
          });
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-slate-400">Loading your liked content...</div>
      </div>
    );
  }

  const displayName = profile?.name || user.name || user.username || 'Your';

  return (
    <div className="h-full overflow-y-auto px-4 md:px-8 py-6 md:py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link href="/profile/edit" className="shrink-0 rounded-full overflow-hidden border-2 border-slate-700 w-14 h-14 md:w-16 md:h-16 focus:ring-2 focus:ring-accent/70">
              {profile?.profile_picture_url ? (
                <img src={profile.profile_picture_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-700 flex items-center justify-center text-slate-400 text-lg font-semibold">
                  {(displayName || '?').charAt(0).toUpperCase()}
                </div>
              )}
            </Link>
            <div>
              <div className="pill w-fit mb-2">Your Profile</div>
              <h1 className="text-2xl md:text-3xl font-semibold mb-2">
                {displayName} Liked Content
              </h1>
              <p className="text-sm text-slate-400">
                Media you&apos;ve liked from the club channel
              </p>
              {(profile?.phone || profile?.date_of_birth) && (
                <p className="text-xs text-slate-500 mt-1">
                  {[profile.phone, profile.date_of_birth].filter(Boolean).join(' · ')}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/profile/edit"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition"
            >
              Edit profile
            </Link>
            <Link
              href="/profile/training"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition"
            >
              Training log
            </Link>
            <Link
              href="/profile/password"
              className="inline-flex items-center rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800/80 transition"
            >
              Change password
            </Link>
          </div>
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
          <div className="max-w-[min(100%,420px)] md:max-w-7xl mx-auto flex flex-col gap-6 md:grid md:grid-cols-2 md:gap-5 lg:grid-cols-3 xl:grid-cols-4 lg:gap-6">
            {likedPosts.map((post) => (
              <MediaCard
                key={post.id}
                post={post}
                featuredImage={getFeaturedImageUrl(post)}
                featuredVideoUrl={getFeaturedVideoUrl(post)}
                featuredAudioUrl={getFeaturedAudioUrl(post)}
                userId={user.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
