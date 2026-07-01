'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import VideoControlsBar, { VIDEO_SKIP_SECONDS } from '@/components/learn/VideoControlsBar';
import YoutubePlayer from '@/components/learn/YoutubePlayer';
import type { PlaybackConfig } from '@/lib/learning/playback';
import { vimeoEmbedUrl } from '@/lib/learning/video';

type VideoPlayerProps = {
  playback: PlaybackConfig;
  title: string;
};

function blockContextMenu(event: React.MouseEvent | React.SyntheticEvent) {
  event.preventDefault();
}

type VimeoPlayerApi = {
  play: () => Promise<void>;
  pause: () => Promise<void>;
  getCurrentTime: () => Promise<number>;
  setCurrentTime: (seconds: number) => Promise<void>;
  on: (event: string, callback: () => void) => void;
  destroy: () => void;
};

declare global {
  interface Window {
    Vimeo?: {
      Player: new (element: HTMLIFrameElement) => VimeoPlayerApi;
    };
  }
}

let vimeoApiPromise: Promise<void> | null = null;

function loadVimeoPlayerApi() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Vimeo?.Player) return Promise.resolve();
  if (vimeoApiPromise) return vimeoApiPromise;

  vimeoApiPromise = new Promise((resolve, reject) => {
    if (document.querySelector('script[data-vimeo-player-api]')) {
      const check = setInterval(() => {
        if (window.Vimeo?.Player) {
          clearInterval(check);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://player.vimeo.com/api/player.js';
    script.async = true;
    script.dataset.vimeoPlayerApi = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Vimeo player API'));
    document.body.appendChild(script);
  });

  return vimeoApiPromise;
}

function VimeoPlayer({ vimeoId, title }: { vimeoId: string; title: string }) {
  const embed = vimeoEmbedUrl(`https://vimeo.com/${vimeoId}`);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<VimeoPlayerApi | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!embed || !iframeRef.current) return;

    let cancelled = false;

    loadVimeoPlayerApi()
      .then(() => {
        if (cancelled || !iframeRef.current || !window.Vimeo) return;

        playerRef.current?.destroy();
        const player = new window.Vimeo.Player(iframeRef.current);
        playerRef.current = player;

        player.on('play', () => {
          if (!cancelled) setPlaying(true);
        });
        player.on('pause', () => {
          if (!cancelled) setPlaying(false);
        });
        player.on('ended', () => {
          if (!cancelled) setPlaying(false);
        });

        if (!cancelled) setReady(true);
      })
      .catch(() => {
        if (!cancelled) setReady(false);
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy();
      playerRef.current = null;
      setReady(false);
      setPlaying(false);
    };
  }, [embed]);

  const togglePlayback = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    if (playing) {
      await player.pause();
    } else {
      await player.play();
    }
  }, [playing]);

  const seekRelative = useCallback(async (delta: number) => {
    const player = playerRef.current;
    if (!player) return;
    const current = await player.getCurrentTime();
    await player.setCurrentTime(Math.max(0, current + delta));
  }, []);

  const reloadVideo = useCallback(async () => {
    const player = playerRef.current;
    if (!player) return;
    await player.setCurrentTime(0);
    await player.pause();
    setPlaying(false);
  }, []);

  if (!embed) return null;

  return (
    <div
      className="lesson-video-player rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
      onContextMenu={blockContextMenu}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="relative aspect-video">
        <iframe
          ref={iframeRef}
          src={embed}
          title={title}
          className="lesson-video-vimeo-embed h-full w-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="autoplay; encrypted-media"
          sandbox="allow-scripts allow-same-origin allow-presentation"
        />
        <div
          className="absolute inset-0 z-10"
          aria-hidden
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>
      <VideoControlsBar
        playing={playing}
        ready={ready}
        onPlayPause={() => void togglePlayback()}
        onRewind={() => void seekRelative(-VIDEO_SKIP_SECONDS)}
        onForward={() => void seekRelative(VIDEO_SKIP_SECONDS)}
        onReload={() => void reloadVideo()}
      />
    </div>
  );
}

function DirectVideoPlayer({ playbackUrl, title }: { playbackUrl: string; title: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);

  const togglePlayback = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }, []);

  const seekRelative = useCallback((delta: number) => {
    const el = videoRef.current;
    if (!el) return;
    el.currentTime = Math.max(0, Math.min(el.duration || Infinity, el.currentTime + delta));
  }, []);

  const reloadVideo = useCallback(() => {
    const el = videoRef.current;
    if (!el) return;
    el.pause();
    el.currentTime = 0;
    setPlaying(false);
  }, []);

  return (
    <div
      className="lesson-video-player rounded-xl overflow-hidden border border-slate-800 bg-black select-none"
      onContextMenu={blockContextMenu}
      onDragStart={(event) => event.preventDefault()}
    >
      <div className="relative aspect-video">
        <video
          ref={videoRef}
          playsInline
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          disableRemotePlayback
          onContextMenu={(event) => event.preventDefault()}
          onLoadedData={() => setReady(true)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          className="h-full w-full"
          src={playbackUrl}
          title={title}
        >
          <track kind="captions" />
        </video>
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

export default function VideoPlayer({ playback, title }: VideoPlayerProps) {
  if (playback.provider === 'youtube') {
    return <YoutubePlayer videoId={playback.videoId} title={title} />;
  }

  if (playback.provider === 'vimeo') {
    return <VimeoPlayer vimeoId={playback.vimeoId} title={title} />;
  }

  return <DirectVideoPlayer playbackUrl={playback.playbackUrl} title={title} />;
}
