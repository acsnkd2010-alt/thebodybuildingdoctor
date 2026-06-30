import type { ReactNode } from 'react';
import Link from 'next/link';

import SiteLogo from '@/components/SiteLogo';
import { getSessionUser } from '@/lib/auth/session';
import { getSiteInfo } from '@/lib/wordpress';
import { APP_NAME, resolveLogoUrl } from '@/lib/branding';

export default async function MarketingLayout({ children }: { children: ReactNode }) {
  const [user, siteInfo] = await Promise.all([getSessionUser(), getSiteInfo()]);
  const siteName = siteInfo.site_name || APP_NAME;
  const logoUrl = resolveLogoUrl(siteInfo.logo_url);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <SiteLogo logoUrl={logoUrl} siteName={siteName} variant="header" href="/" />
          <nav className="hidden sm:flex items-center gap-6 text-sm text-slate-300">
            <a href="#about" className="hover:text-white transition">
              About
            </a>
            <a href="#offerings" className="hover:text-white transition">
              Programs
            </a>
            <a href="#courses" className="hover:text-white transition">
              Courses
            </a>
            <a href="#apply" className="hover:text-white transition">
              Apply
            </a>
          </nav>
          <div className="flex items-center gap-2 shrink-0">
            {user ? (
              <Link
                href="/dashboard"
                className="rounded-full bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Member area
              </Link>
            ) : (
              <Link
                href="/login"
                className="rounded-full border border-slate-700 px-4 py-2 text-xs sm:text-sm text-slate-200 hover:bg-slate-800 transition"
              >
                Login
              </Link>
            )}
            <a
              href="#apply"
              className="rounded-full bg-accent px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Get started
            </a>
          </div>
        </div>
      </header>

      <div className="flex-1">{children}</div>

      <footer className="border-t border-slate-800 bg-slate-950/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-sm text-slate-400">
          <div>
            <p className="font-medium text-slate-200">{siteName}</p>
            <p className="mt-1 max-w-md">
              Evidence-based bodybuilding education, coaching, and member content.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link href="/login" className="hover:text-slate-200 transition">
              Member login
            </Link>
            <a href="#apply" className="hover:text-slate-200 transition">
              Request access
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
