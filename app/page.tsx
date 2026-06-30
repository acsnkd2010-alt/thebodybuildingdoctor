import Link from 'next/link';
import { SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { getSiteInfo } from '../lib/wordpress';
import { APP_LOGO_PATH, APP_NAME, resolveLogoUrl } from '../lib/branding';

export default async function Home() {
  const siteInfo = await getSiteInfo();
  const logoUrl = resolveLogoUrl(siteInfo.logo_url);

  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full space-y-10 text-center">
        <Link href="/" className="inline-block mb-2">
          <img
            src={logoUrl}
            alt={siteInfo.site_name || APP_NAME}
            width={220}
            height={64}
            className="h-16 w-auto object-contain mx-auto"
            loading="eager"
          />
        </Link>
        <div className="space-y-4">
          <div className="pill mx-auto flex items-center gap-2">
            <SparklesIcon className="w-3 h-3" />
            Members Only Media Channel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-accent to-accentSoft bg-clip-text text-transparent">
            Elite Bodybuilding Content
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            Training content, insights, and updates for club members. Manage courses,
            enrollments, and articles from the admin dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8">
          <div className="card-surface p-4 text-center">
            <FireIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
            <h3 className="text-sm font-semibold mb-1">Training Content</h3>
            <p className="text-xs text-slate-400">Expert workout breakdowns</p>
          </div>
          <div className="card-surface p-4 text-center">
            <TrophyIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
            <h3 className="text-sm font-semibold mb-1">Posing Tutorials</h3>
            <p className="text-xs text-slate-400">Competition-ready techniques</p>
          </div>
          <div className="card-surface p-4 text-center">
            <SparklesIcon className="w-8 h-8 mx-auto mb-2 text-accent" />
            <h3 className="text-sm font-semibold mb-1">Prep Insights</h3>
            <p className="text-xs text-slate-400">Nutrition &amp; strategy</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-white shadow-soft-glow hover:bg-accent/90 transition transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login to view content
          </Link>
        </div>
      </div>
    </div>
  );
}

