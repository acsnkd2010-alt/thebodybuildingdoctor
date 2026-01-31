'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from './Toast';

interface SinglePostViewProps {
  post: {
    id: number;
    date: string;
    title: { rendered: string };
    content: { rendered: string };
    excerpt: { rendered: string };
    featured_media: number;
    _embedded?: {
      'wp:featuredmedia'?: Array<{
        source_url: string;
        media_details?: {
          sizes?: Record<string, { source_url: string; width?: number; height?: number }>;
        };
      }>;
    };
    acf?: { likes?: number; liked_by?: number[] };
  };
  featuredImageUrl: string | null;
  featuredVideoUrl: string | null;
  featuredAudioUrl: string | null;
  userId: number;
}

export default function SinglePostView({ post, featuredImageUrl, featuredVideoUrl, featuredAudioUrl, userId }: SinglePostViewProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.acf?.likes ?? 0);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const likedBy = post.acf?.liked_by ?? [];
    setIsLiked(likedBy.includes(userId));
  }, [post, userId]);

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling) return;
    setIsToggling(true);
    const prevLiked = isLiked;
    const prevLikes = likes;
    setIsLiked(!prevLiked);
    setLikes(prevLiked ? likes - 1 : likes + 1);
    try {
      const res = await fetch(`/api/media/${post.id}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) {
        setIsLiked(prevLiked);
        setLikes(prevLikes);
        setToast({ message: 'Failed to update like.', type: 'error' });
        return;
      }
      const data = await res.json();
      const liked = typeof data.liked === 'boolean' ? data.liked : !prevLiked;
      const likesCount = typeof data.likes === 'number' ? data.likes : (prevLiked ? likes - 1 : likes + 1);
      setIsLiked(liked);
      setLikes(likesCount);
      setToast({
        message: liked ? 'Added to liked!' : 'Removed from liked.',
        type: 'success',
      });
    } catch {
      setIsLiked(prevLiked);
      setLikes(prevLikes);
      setToast({ message: 'Something went wrong.', type: 'error' });
    } finally {
      setIsToggling(false);
    }
  }

  const dateStr = new Date(post.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <article className="max-w-4xl mx-auto">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition"
      >
        <ArrowLeftIcon className="h-4 w-4" />
        Back to news
      </Link>

      <header className="mb-8">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
          {dateStr}
        </p>
        <h1
          className="text-3xl md:text-4xl font-bold leading-tight mb-4"
          dangerouslySetInnerHTML={{ __html: post.title.rendered }}
        />
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <button
            onClick={handleLike}
            disabled={isToggling}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full transition ${
              isLiked ? 'bg-red-500/20 text-red-400' : 'bg-slate-800/80 text-slate-400 hover:bg-slate-700/80'
            } ${isToggling ? 'opacity-50' : ''}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? <HeartSolidIcon className="h-4 w-4" /> : <HeartIcon className="h-4 w-4" />}
            <span>{likes} {likes === 1 ? 'like' : 'likes'}</span>
          </button>
        </div>
      </header>

      {featuredVideoUrl && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-6">
          <video
            src={featuredVideoUrl}
            className="w-full h-full object-cover"
            controls
            playsInline
            preload="metadata"
            poster={featuredImageUrl || undefined}
          />
        </div>
      )}

      {!featuredVideoUrl && featuredImageUrl && (
        <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 mb-6">
          <Image
            src={featuredImageUrl}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 896px) 100vw, 896px"
            priority
          />
        </div>
      )}

      {featuredAudioUrl && (
        <div className="rounded-2xl bg-slate-900/80 p-4 mb-6">
          <audio src={featuredAudioUrl} controls className="w-full" preload="metadata" />
        </div>
      )}

      <div
        className="single-post-content text-slate-300 leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:mb-4 [&_a]:text-sky-400 [&_a]:underline [&_a:hover]:text-sky-300 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-1 [&_img]:rounded-xl [&_img]:max-w-full [&_img]:h-auto"
        dangerouslySetInnerHTML={{ __html: post.content.rendered }}
      />

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2000}
        />
      )}
    </article>
  );
}
