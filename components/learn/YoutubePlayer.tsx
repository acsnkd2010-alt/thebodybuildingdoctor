'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { PlayIcon } from '@heroicons/react/24/solid';

import { extractYoutubeId } from '@/lib/learning/video';

type YoutubePlayerProps = {
  url: string;
  title: string;
};

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars?: Record<string, number | string>;
          events?: {
            onReady?: () => void;
            onStateChange?: (event: { data: number }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState: { PLAYING: number; PAUSED: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYoutubeIframeApi() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (!document.querySelector('script[data-youtube-iframe-api]')) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      script.dataset.youtubeIframeApi = 'true';
      document.body.appendChild(script);
    }
  });

  return youtubeApiPromise;
}

export default function YoutubePlayer({ url, title }: YoutubePlayerProps) {
  const videoId = extractYoutubeId(url);
  const elementId = useId().replace(/:/g, '');
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!videoId) return;

    let cancelled = false;

    loadYoutubeIframeApi().then(() => {
      if (cancelled || !window.YT) return;

      playerRef.current?.destroy();

      playerRef.current = new window.YT.Player(elementId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          fs: 0,
          disablekb: 1,
          iv_load_policy: 3,
          playsinline: 1,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (!cancelled) setReady(true);
          },
          onStateChange: (event) => {
            const YT = window.YT!;
            setPlaying(event.data === YT.PlayerState.PLAYING);
          },
        },
      });
    });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [elementId, videoId]);

  function togglePlayback() {
    const player = playerRef.current;
    if (!player || !window.YT) return;

    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }

  if (!videoId) return null;

  return (
    <div
      className="lesson-video-player relative aspect-video rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
      onContextMenu={(event) => event.preventDefault()}
    >
      <div id={elementId} className="h-full w-full" title={title} />
      {ready && !playing && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/35"
          aria-label="Play video"
        >
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/90 text-white shadow-lg">
            <PlayIcon className="h-8 w-8 ml-1" />
          </span>
        </button>
      )}
      {ready && playing && (
        <button
          type="button"
          onClick={togglePlayback}
          className="absolute inset-0 z-10 cursor-pointer"
          aria-label="Pause video"
        />
      )}
    </div>
  );
}
