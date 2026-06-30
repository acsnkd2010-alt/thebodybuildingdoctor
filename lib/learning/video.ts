export function isYoutubeUrl(url: string) {
  return /youtube\.com|youtu\.be/i.test(url);
}

export function isVimeoUrl(url: string) {
  return /vimeo\.com/i.test(url);
}

export function isDirectVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}

export function extractYoutubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

/** Privacy-enhanced embed with branding and sharing UI minimized. */
export function youtubeEmbedUrl(url: string, origin?: string) {
  const id = extractYoutubeId(url);
  if (!id) return null;

  const params = new URLSearchParams({
    modestbranding: '1',
    rel: '0',
    fs: '0',
    disablekb: '1',
    iv_load_policy: '3',
    playsinline: '1',
    controls: '1',
    color: 'white',
    enablejsapi: '0',
  });

  if (origin) {
    params.set('origin', origin);
  }

  return `https://www.youtube-nocookie.com/embed/${id}?${params.toString()}`;
}

export function vimeoEmbedUrl(url: string) {
  const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!match) return null;

  const params = new URLSearchParams({
    title: '0',
    byline: '0',
    portrait: '0',
    dnt: '1',
    transparent: '0',
    controls: '0',
  });

  return `https://player.vimeo.com/video/${match[1]}?${params.toString()}`;
}
