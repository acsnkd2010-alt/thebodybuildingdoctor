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

  const url = new URL(`${WORDPRESS_API_URL}/wp-json/wp/v2/posts`);
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

  const url = new URL(`${WORDPRESS_API_URL}/wp-json/wp/v2/posts/${id}`);
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
