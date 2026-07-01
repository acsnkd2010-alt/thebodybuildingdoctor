'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';

import VideoControlsBar, { VIDEO_SKIP_SECONDS } from '@/components/learn/VideoControlsBar';

const YOUTUBE_NOCOOKIE_HOST = 'https://www.youtube-nocookie.com';

type YoutubePlayerProps = {
  videoId: string;
  title: string;
};

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
  getPlayerState: () => number;
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          host?: string;
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

export default function YoutubePlayer({ videoId, title }: YoutubePlayerProps) {
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
        host: YOUTUBE_NOCOOKIE_HOST,
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
          cc_load_policy: 3,
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
      setReady(false);
      setPlaying(false);
    };
  }, [elementId, videoId]);

  const togglePlayback = useCallback(() => {
    const player = playerRef.current;
    if (!player || !window.YT) return;

    const state = player.getPlayerState();
    if (state === window.YT.PlayerState.PLAYING) {
      player.pauseVideo();
    } else {
      player.playVideo();
    }
  }, []);

  const seekRelative = useCallback((delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    const next = Math.max(0, player.getCurrentTime() + delta);
    player.seekTo(next, true);
  }, []);

  const reloadVideo = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    player.seekTo(0, true);
    player.pauseVideo();
    setPlaying(false);
  }, []);

  if (!videoId) return null;

  return (
    <div
      className="lesson-video-player rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="relative aspect-video">
        <div id={elementId} className="lesson-video-youtube-embed h-full w-full" title={title} />
        <div
          className="absolute inset-0 z-10"
          aria-hidden
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
      <VideoControlsBar
        playing={playing}
        ready={ready}
        onPlayPause={togglePlayback}
        onRewind={() => seekRelative(-VIDEO_SKIP_SECONDS)}
        onForward={() => seekRelative(VIDEO_SKIP_SECONDS)}
        onReload={reloadVideo}
      />
    </div>
  );
}
