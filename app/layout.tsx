import './globals.css';
import type { ReactNode } from 'react';
import Link from 'next/link';
import LogoutButton from '@/components/LogoutButton';
import { getSessionUser } from '@/lib/auth/session';
import { UserIcon } from '@heroicons/react/24/outline';

export const metadata = {
  title: 'Bodybuilding Club Media Channel',
  description: 'Members-only bodybuilding media channel powered by WordPress.'
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();

  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-slate-100">
        <div className="flex min-h-screen">
          <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-950/70 backdrop-blur">
            <div className="px-6 py-6 border-b border-slate-800">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-400">
                The Bodybuilding Doctor
              </div>
              <div className="mt-2 text-lg font-semibold">Media Channel</div>
            </div>
            {user && (
              <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
                <div className="px-3 py-2 mb-2 text-xs text-slate-500 uppercase tracking-wide">
                  Menu
                </div>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
                >
                  <UserIcon className="w-4 h-4" />
                  Profile
                </Link>
                <div className="pt-4 mt-4 border-t border-slate-800">
                  <div className="px-3 py-2 mb-2 text-xs text-slate-500">
                    {user.name || user.username || user.email}
                  </div>
                  <LogoutButton />
                </div>
              </nav>
            )}
            {!user && (
              <nav className="flex-1 px-4 py-4 space-y-1 text-sm">
                <Link
                  href="/login"
                  className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block rounded-lg px-3 py-2 text-slate-200 hover:bg-slate-800/70 transition"
                >
                  Register
                </Link>
              </nav>
            )}
            <div className="px-6 py-4 text-xs text-slate-500 border-t border-slate-800">
              Built with Next.js &amp; WordPress
            </div>
          </aside>
          <main className="flex-1 flex flex-col">
            <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
              <div className="text-sm font-semibold">Bodybuilding Media</div>
              <Link
                href="/dashboard"
                className="text-xs px-3 py-1 rounded-full bg-accent text-slate-950 font-semibold"
              >
                Dashboard
              </Link>
            </header>
            <div className="flex-1">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}

