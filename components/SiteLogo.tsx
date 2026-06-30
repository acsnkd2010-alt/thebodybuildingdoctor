import Link from 'next/link';

import { APP_LOGO_PATH } from '@/lib/branding';

interface SiteLogoProps {
  logoUrl?: string | null;
  siteName: string;
  siteDescription?: string;
  variant?: 'sidebar' | 'header';
  href?: string;
}

export default function SiteLogo({
  logoUrl = APP_LOGO_PATH,
  siteName,
  siteDescription,
  variant = 'sidebar',
  href = '/dashboard',
}: SiteLogoProps) {
  const src = logoUrl?.trim() || APP_LOGO_PATH;

  if (variant === 'header') {
    return (
      <Link href={href} className="flex items-center gap-2 shrink-0">
        <img
          src={src}
          alt={siteName}
          width={120}
          height={36}
          className="h-9 w-auto object-contain object-left"
          loading="eager"
        />
      </Link>
    );
  }

  return (
    <Link href={href} className="block">
      <div className="relative w-full max-w-[180px] aspect-[2/1]">
        <img
          src={src}
          alt={siteName}
          className="absolute inset-0 w-full h-full object-contain object-left"
          loading="eager"
        />
      </div>
      {siteDescription && (
        <p className="mt-2 text-xs text-slate-500 line-clamp-2">{siteDescription}</p>
      )}
    </Link>
  );
}
