'use client';

import { useState, useEffect } from 'react';
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
  userId: number;
}

export default function MediaCard({ post, featuredImage, userId }: MediaCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likes, setLikes] = useState(post.acf?.likes || 0);
  const [isToggling, setIsToggling] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    // Check initial like status
    const likedBy = post.acf?.liked_by || [];
    setIsLiked(likedBy.includes(userId));
  }, [post, userId]);

  async function handleLike() {
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
      });

      if (!res.ok) {
        // Revert on error
        setIsLiked(previousLiked);
        setLikes(previousLikes);
        setToast({ message: 'Failed to update like. Please try again.', type: 'error' });
        throw new Error('Failed to update like');
      }

      const data = await res.json();
      setIsLiked(data.liked);
      setLikes(data.likes);
      setToast({
        message: data.liked ? 'Added to your liked content!' : 'Removed from liked content.',
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

  return (
    <div className="card-surface group relative overflow-hidden">
      {featuredImage ? (
        <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
          <Image
            src={featuredImage}
            alt={post.title.rendered}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      ) : (
        <div className="aspect-[4/3] bg-slate-900 flex items-center justify-center">
          <div className="text-slate-600 text-xs">No Image</div>
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="text-sm font-semibold line-clamp-2 flex-1"
            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
          />
          <button
            onClick={handleLike}
            disabled={isToggling}
            className={`flex-shrink-0 p-1.5 rounded-full transition-all ${
              isLiked
                ? 'bg-red-500/20 text-red-400'
                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700/50'
            } ${isToggling ? 'opacity-50' : ''}`}
            aria-label={isLiked ? 'Unlike' : 'Like'}
          >
            {isLiked ? (
              <HeartSolidIcon className="w-4 h-4" />
            ) : (
              <HeartIcon className="w-4 h-4" />
            )}
          </button>
        </div>

        <div
          className="text-xs text-slate-400 line-clamp-2"
          dangerouslySetInnerHTML={{ __html: post.excerpt.rendered }}
        />

        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-[10px] text-slate-500 uppercase tracking-wide">
            {date}
          </span>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            {isLiked ? (
              <HeartSolidIcon className="w-3 h-3 text-red-400" />
            ) : (
              <HeartIcon className="w-3 h-3" />
            )}
            <span>{likes}</span>
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
    </div>
  );
}
