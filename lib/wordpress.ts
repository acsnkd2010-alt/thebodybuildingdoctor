const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export interface WordPressPost {
  id: number;
  date: string;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  excerpt: {
    rendered: string;
  };
  featured_media: number;
  featured_video_url?: string;
  featured_audio_url?: string;
  meta?: {
    bmc_featured_video_url?: string;
    bmc_featured_audio_url?: string;
  };
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      media_details?: {
        sizes?: {
          medium?: { source_url: string };
          large?: { source_url: string };
          full?: { source_url: string };
        };
      };
    }>;
  };
  categories?: number[];
  acf?: {
    likes?: number;
    liked_by?: number[];
  };
}

export interface WordPressMedia {
  id: number;
  source_url: string;
  media_details?: {
    sizes?: {
      medium?: { source_url: string };
      large?: { source_url: string };
      full?: { source_url: string };
    };
  };
}

export async function fetchWordPressPosts(
  page: number = 1,
  perPage: number = 12
): Promise<{ posts: WordPressPost[]; totalPages: number }> {
  if (!WORDPRESS_API_URL) {
    throw new Error('WordPress API URL not configured');
  }

  // Fetch Media Channel items from our custom post type (registered by the WP plugin)
  // REST base: /wp-json/wp/v2/bmc_media
  const url = new URL(`${WORDPRESS_API_URL}/wp-json/wp/v2/bmc_media`);
  url.searchParams.set('page', String(page));
  url.searchParams.set('per_page', String(perPage));
  url.searchParams.set('_embed', 'true');
  url.searchParams.set('orderby', 'date');
  url.searchParams.set('order', 'desc');

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.statusText}`);
  }

  const posts: WordPressPost[] = await response.json();
  const totalPages = parseInt(
    response.headers.get('x-wp-totalpages') || '1',
    10
  );

  return { posts, totalPages };
}

export async function fetchWordPressPost(id: number): Promise<WordPressPost> {
  if (!WORDPRESS_API_URL) {
    throw new Error('WordPress API URL not configured');
  }

  const url = new URL(`${WORDPRESS_API_URL}/wp-json/wp/v2/bmc_media/${id}`);
  url.searchParams.set('_embed', 'true');

  const response = await fetch(url.toString(), {
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.statusText}`);
  }

  return response.json();
}

export async function fetchWordPressMedia(id: number): Promise<WordPressMedia> {
  if (!WORDPRESS_API_URL) {
    throw new Error('WordPress API URL not configured');
  }

  const response = await fetch(
    `${WORDPRESS_API_URL}/wp-json/wp/v2/media/${id}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!response.ok) {
    throw new Error(`WordPress API error: ${response.statusText}`);
  }

  return response.json();
}

export function getFeaturedImageUrl(post: WordPressPost): string | null {
  if (!post._embedded?.['wp:featuredmedia']?.[0]) {
    return null;
  }

  const media = post._embedded['wp:featuredmedia'][0];
  return (
    media.media_details?.sizes?.large?.source_url ||
    media.media_details?.sizes?.medium?.source_url ||
    media.source_url
  );
}

export function getFeaturedVideoUrl(post: WordPressPost): string | null {
  const url = post.featured_video_url ?? post.meta?.bmc_featured_video_url;
  return url && url.trim() ? url : null;
}

export function getFeaturedAudioUrl(post: WordPressPost): string | null {
  const url = post.featured_audio_url ?? post.meta?.bmc_featured_audio_url;
  return url && url.trim() ? url : null;
}

export interface SiteInfo {
  logo_url: string;
  site_name: string;
  site_description: string;
  site_url: string;
  site_keywords: string;
  site_tags: string;
}

const defaultSiteInfo: SiteInfo = {
  logo_url: '',
  site_name: 'Media Channel',
  site_description: '',
  site_url: '',
  site_keywords: '',
  site_tags: '',
};

export async function getSiteInfo(): Promise<SiteInfo> {
  const baseUrl = (WORDPRESS_API_URL || '').replace(/\/$/, '');
  if (!baseUrl) {
    return defaultSiteInfo;
  }
  try {
    const url = `${baseUrl}/wp-json/bmc/v1/site-info`;
    const res = await fetch(url, {
      next: { revalidate: 300 },
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) return defaultSiteInfo;
    const data = await res.json();
    let logoUrl = typeof data.logo_url === 'string' ? data.logo_url.trim() : '';
    const siteUrl = typeof data.site_url === 'string' ? data.site_url.replace(/\/$/, '') : baseUrl;
    if (logoUrl && !/^https?:\/\//i.test(logoUrl)) {
      logoUrl = siteUrl ? `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl}` : '';
    }
    const envLogo = typeof process.env.NEXT_PUBLIC_LOGO_URL === 'string' ? process.env.NEXT_PUBLIC_LOGO_URL.trim() : '';
    return {
      logo_url: logoUrl || envLogo || '',
      site_name: data.site_name || defaultSiteInfo.site_name,
      site_description: data.site_description || '',
      site_url: data.site_url || '',
      site_keywords: typeof data.site_keywords === 'string' ? data.site_keywords : '',
      site_tags: typeof data.site_tags === 'string' ? data.site_tags : '',
    };
  } catch {
    return defaultSiteInfo;
  }
}
