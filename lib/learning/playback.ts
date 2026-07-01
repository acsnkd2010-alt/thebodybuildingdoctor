import {
  extractYoutubeId,
  isDirectVideoUrl,
  isVimeoUrl,
  isYoutubeUrl,
} from '@/lib/learning/video';

export type YoutubePlayback = {
  provider: 'youtube';
  videoId: string;
};

export type VimeoPlayback = {
  provider: 'vimeo';
  vimeoId: string;
};

export type FilePlayback = {
  provider: 'file';
  playbackUrl: string;
};

export type PlaybackConfig = YoutubePlayback | VimeoPlayback | FilePlayback;

export function resolveLessonPlayback(
  videoUrl: string,
  streamPath: string,
): PlaybackConfig | null {
  const url = videoUrl.trim();
  if (!url) return null;

  if (isYoutubeUrl(url)) {
    const videoId = extractYoutubeId(url);
    if (!videoId) return null;
    return { provider: 'youtube', videoId };
  }

  if (isVimeoUrl(url)) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    if (!match) return null;
    return { provider: 'vimeo', vimeoId: match[1] };
  }

  if (isDirectVideoUrl(url) || url.startsWith('http')) {
    return { provider: 'file', playbackUrl: streamPath };
  }

  return null;
}
