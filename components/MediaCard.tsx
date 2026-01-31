'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import Image from 'next/image';
import Toast from './Toast';

interface MediaPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  acf?: {
    likes?: number;
    liked_by?: number[];
  };
}

interface MediaCardProps {
  post: MediaPost;
  featuredImage: string | null;
  featuredVideoUrl: string | null;
  featuredAudioUrl: string | null;
  userId: number;
}

export default function MediaCard({ post, featuredImage, featuredVideoUrl, featuredAudioUrl, userId }: MediaCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.acf?.likes || 0);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check initial like status
    const likedBy = post.acf?.liked_by || [];
    setIsLiked(likedBy.includes(userId));
  }, [post, userId]);

  async function handleLike(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (isToggling) return;

    setIsToggling(true);
    const previousLiked = isLiked;
    const previousLikes = likes;

    // Optimistic update
    setIsLiked(!previousLiked);
    setLikes(previousLiked ? likes - 1 : likes + 1);

    try {
      const res = await fetch(`/api/media/${post.id}/like`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        // Revert on error
        setIsLiked(previousLiked);
        setLikes(previousLikes);
        setToast({ message: 'Failed to update like. Please try again.', type: 'error' });
        throw new Error('Failed to update like');
      }

      const data = await res.json();
      const liked = typeof data.liked === 'boolean' ? data.liked : !previousLiked;
      const likesCount = typeof data.likes === 'number' ? data.likes : (previousLiked ? likes - 1 : likes + 1);
      setIsLiked(liked);
      setLikes(likesCount);
      setToast({
        message: liked ? 'Added to your liked content!' : 'Removed from liked content.',
        type: 'success',
      });
    } catch (error) {
      console.error('Like error:', error);
    } finally {
      setIsToggling(false);
    }
  }

  const date = new Date(post.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  // Mobile: square feed style. Desktop: same 4/3 ratio as before
  const mediaArea = (
    <div className="relative w-full overflow-hidden bg-slate-900 aspect-square max-h-[min(70vmin,420px)] mx-auto md:aspect-[4/3] md:max-h-none">
      {featuredVideoUrl ? (
        <video
          src={featuredVideoUrl}
          className="absolute inset-0 w-full h-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
          poster={featuredImage || undefined}
        />
      ) : featuredImage ? (
        <Image
          src={featuredImage}
          alt=""
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      ) : featuredAudioUrl ? (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
          <audio src={featuredAudioUrl} controls className="w-full max-w-[90%]" preload="metadata" />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-sm">
          No media
        </div>
      )}
    </div>
  );

  return (
    <Link href={`/dashboard/post/${post.id}`} className="block group">
      <div className="card-surface relative overflow-hidden flex flex-col hover:border-slate-600 transition-colors rounded-2xl">
        {mediaArea}
        <div className="p-3 md:p-4 flex flex-col gap-2">
          <h3
            className="text-sm font-semibold line-clamp-2 group-hover:text-sky-300 transition-colors"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <div
            className="text-xs text-slate-400 line-clamp-2"
            dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
          />
          <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-800">
            <span className="text-[10px] text-slate-500">{date}</span>
            <button
              onClick={handleLike}
              disabled={isToggling}
              className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs transition-all ${
                isLiked
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
              } ${isToggling ? 'opacity-50' : ''}`}
              aria-label={isLiked ? 'Unlike' : 'Like'}
            >
              {isLiked ? (
                <HeartSolidIcon className="w-3.5 h-3.5" />
              ) : (
                <HeartIcon className="w-3.5 h-3.5" />
              )}
              <span>{likes}</span>
            </button>
          </div>
        </div>
      </div>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
          duration={2000}
        />
      )}
    </Link>
  );
}
