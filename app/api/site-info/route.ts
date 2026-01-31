import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 300; // 5 min

const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL;

export async function GET() {
  try {
    if (!WORDPRESS_API_URL) {
      return NextResponse.json(
        { logo_url: '', site_name: 'Media Channel', site_description: '', site_url: '', site_keywords: '', site_tags: '' },
        { status: 200 }
      );
    }

    const res = await fetch(`${WORDPRESS_API_URL}/wp-json/bmc/v1/site-info`, {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return NextResponse.json(
        { logo_url: '', site_name: 'Media Channel', site_description: '', site_url: '', site_keywords: '', site_tags: '' },
        { status: 200 }
      );
    }

    const data = await res.json();
    let logoUrl = data.logo_url || '';
    const base = (WORDPRESS_API_URL || '').replace(/\/$/, '');
    const siteUrl = (data.site_url || base || '').replace(/\/$/, '');
    if (logoUrl && typeof logoUrl === 'string' && !/^https?:\/\//i.test(logoUrl.trim())) {
      logoUrl = siteUrl ? `${siteUrl}${logoUrl.startsWith('/') ? '' : '/'}${logoUrl.trim()}` : '';
    } else if (typeof logoUrl === 'string') {
      logoUrl = logoUrl.trim();
    } else {
      logoUrl = '';
    }
    const envLogo = process.env.NEXT_PUBLIC_LOGO_URL?.trim() || '';
    return NextResponse.json({
      logo_url: logoUrl || envLogo,
      site_name: data.site_name || 'Media Channel',
      site_description: data.site_description || '',
      site_url: data.site_url || '',
      site_keywords: data.site_keywords || '',
      site_tags: data.site_tags || '',
    });
  } catch {
    return NextResponse.json(
      { logo_url: '', site_name: 'Media Channel', site_description: '', site_url: '', site_keywords: '', site_tags: '' },
      { status: 200 }
    );
  }
}
