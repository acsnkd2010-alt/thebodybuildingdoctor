import Link from 'next/link';

interface SiteLogoProps {
  logoUrl: string | null;
  siteName: string;
  siteDescription?: string;
  variant?: 'sidebar' | 'header';
}

export default function SiteLogo({
  logoUrl,
  siteName,
  siteDescription,
  variant = 'sidebar',
}: SiteLogoProps) {
  const href = '/dashboard';

  if (variant === 'header') {
    return (
      <Link href={href} className="flex items-center gap-2 shrink-0">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={siteName}
            width={120}
            height={36}
            className="h-9 w-auto object-contain object-left"
            loading="eager"
          />
        ) : (
          <span className="text-sm font-semibold text-slate-200">{siteName}</span>
        )}
      </Link>
    );
  }

  return (
    <Link href={href} className="block">
      {logoUrl ? (
        <div className="relative w-full max-w-[180px] aspect-[2/1]">
          <img
            src={logoUrl}
            alt={siteName}
            className="absolute inset-0 w-full h-full object-contain object-left"
            loading="eager"
          />
        </div>
      ) : (
        <>
          <div className="text-xs uppercase tracking-[0.25em] text-slate-400">{siteName}</div>
          <div className="mt-2 text-lg font-semibold">Media Channel</div>
        </>
      )}
      {siteDescription && !logoUrl && (
        <p className="mt-1 text-xs text-slate-500 line-clamp-2">{siteDescription}</p>
      )}
    </Link>
  );
}
