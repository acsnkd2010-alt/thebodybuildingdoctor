import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Health check for production login debugging.
 * Open https://app.thebodybuildingdoctor.in/api/health to verify config (no secrets exposed).
 */
export async function GET() {
  const baseUrl = (process.env.WORDPRESS_API_URL || '').replace(/\/$/, '');
  const wordpressUrlConfigured = !!baseUrl;
  const jwtConfigured = !!process.env.JWT_SECRET;

  let wordpressReachable = false;
  if (baseUrl) {
    try {
      const res = await fetch(`${baseUrl}/wp-json/bmc/v1/site-info`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(8000),
      });
      wordpressReachable = res.ok;
    } catch {
      wordpressReachable = false;
    }
  }

  return NextResponse.json({
    ok: wordpressUrlConfigured && jwtConfigured && wordpressReachable,
    wordpress_url_configured: wordpressUrlConfigured,
    wordpress_reachable: wordpressReachable,
    jwt_configured: jwtConfigured,
    hint: !wordpressUrlConfigured
      ? 'Set WORDPRESS_API_URL in Vercel (e.g. https://thebodybuildingdoctor.in)'
      : !jwtConfigured
        ? 'Set JWT_SECRET in Vercel'
        : !wordpressReachable
          ? 'App cannot reach WordPress. Check WORDPRESS_API_URL and WordPress is up.'
          : 'Config OK. If login fails, check: user exists on WordPress, correct password, user enrolled in BMC Users.',
  });
}
