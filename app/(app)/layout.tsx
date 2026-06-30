import type { ReactNode } from 'react';
import Link from 'next/link';

import DashboardNav from '@/components/DashboardNav';
import LogoutButton from '@/components/LogoutButton';
import MobileNav from '@/components/MobileNav';
import SiteLogo from '@/components/SiteLogo';
import { getSessionUser } from '@/lib/auth/session';
import { isAdmin, isMediaChannelOnly } from '@/lib/auth/roles';
import { getSiteInfo } from '@/lib/wordpress';
import { APP_NAME, resolveLogoUrl } from '@/lib/branding';

export default async function AppShellLayout({ children }: { children: ReactNode }) {
  const [user, siteInfo] = await Promise.all([getSessionUser(), getSiteInfo()]);
  const siteName = siteInfo.site_name || APP_NAME;
  const admin = user ? isAdmin(user.roles) : false;
  const mediaChannelOnly = user ? isMediaChannelOnly(user.roles) : false;
  const userLabel = user?.name || user?.username || user?.email;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/70 backdrop-blur shrink-0">
        <div className="px-6 py-6 border-b border-slate-800">
          <SiteLogo
            logoUrl={resolveLogoUrl(siteInfo.logo_url)}
            siteName={siteName}
            siteDescription={siteInfo.site_description}
            variant="sidebar"
          />
        </div>
        {user ? (
          <div className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <DashboardNav
                isAdmin={admin}
                mediaChannelOnly={mediaChannelOnly}
                userLabel={userLabel}
              />
            </div>
            <div className="px-4 py-4 border-t border-slate-800">
              <LogoutButton />
            </div>
          </div>
        ) : (
          <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
            <Link
              href="/"
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
            >
              Home
            </Link>
            <Link
              href="/login"
              className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
            >
              Login
            </Link>
          </nav>
        )}
        <div className="px-6 py-4 text-xs text-slate-500 border-t border-slate-800">{APP_NAME}</div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur gap-3">
          <SiteLogo
            logoUrl={resolveLogoUrl(siteInfo.logo_url)}
            siteName={siteName}
            variant="header"
          />
          {user ? (
            <MobileNav
              isAdmin={admin}
              mediaChannelOnly={mediaChannelOnly}
              userLabel={userLabel}
              siteName={siteName}
            />
          ) : (
            <Link
              href="/login"
              className="text-xs px-3 py-1 rounded-full bg-accent text-white font-semibold shrink-0"
            >
              Login
            </Link>
          )}
        </header>
        <div className="flex-1">{children}</div>
      </main>
    </div>
  );
}
