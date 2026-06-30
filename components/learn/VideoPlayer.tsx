'use client';

import { useCallback, useRef, useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

import YoutubePlayer from '@/components/learn/YoutubePlayer';
import {
  isDirectVideoUrl,
  isVimeoUrl,
  isYoutubeUrl,
  vimeoEmbedUrl,
} from '@/lib/learning/video';

type VideoPlayerProps = {
  url: string;
  title: string;
};

function blockContextMenu(event: React.MouseEvent | React.SyntheticEvent) {
  event.preventDefault();
}

function VimeoPlayer({ url, title }: { url: string; title: string }) {
  const embed = vimeoEmbedUrl(url);
  const [playing, setPlaying] = useState(false);

  if (!embed) return null;

  return (
    <div
      className="lesson-video-player relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
      onContextMenu={blockContextMenu}
    >
      <iframe
        src={playing ? `${embed}&autoplay=1` : embed}
        title={title}
        className="h-full w-full border-0"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="autoplay; encrypted-media"
        sandbox="allow-scripts allow-same-origin allow-presentation"
      />
      {!playing && (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35"
          aria-label="Play video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg">
            <PlayIcon className="h-8 w-8 ml-1" />
          </span>
        </button>
      )}
    </div>
  );
}

export default function VideoPlayer({ url, title }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handleVideoContextMenu = useCallback((event: React.MouseEvent<HTMLVideoElement>) => {
    event.preventDefault();
  }, []);

  const toggleFilePlayback = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
      setPlaying(true);
    } else {
      el.pause();
      setPlaying(false);
    }
  }, []);

  if (!url) {
    return (
      <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center text-sm text-slate-500">
        No video for this lesson
      </div>
    );
  }

  if (isYoutubeUrl(url)) {
    return <YoutubePlayer url={url} title={title} />;
  }

  if (isVimeoUrl(url)) {
    return <VimeoPlayer url={url} title={title} />;
  }

  if (isDirectVideoUrl(url) || url.startsWith('http')) {
    return (
      <div
        className="lesson-video-player relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
        onContextMenu={blockContextMenu}
      >
        <video
          ref={videoRef}
          playsInline
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={handleVideoContextMenu}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          className="h-full w-full"
          src={url}
          title={title}
        >
          <track kind="captions" />
        </video>
        {!playing && (
          <button
            type="button"
            onClick={toggleFilePlayback}
            className="absolute inset-0 z-10 flex items-center justify-center bg-black/35"
            aria-label="Play video"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg">
              <PlayIcon className="h-8 w-8 ml-1" />
            </span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="aspect-video rounded-xl border border-slate-800 bg-slate-900 flex items-center justify-center p-6 text-center text-sm text-slate-400">
      This video cannot be played here. Contact your coach if the problem continues.
    </div>
  );
}
