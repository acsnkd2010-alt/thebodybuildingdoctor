import Link from 'next/link';
import { SparklesIcon, FireIcon, TrophyIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <div className="max-w-2xl w-full space-y-10 text-center">
        <div className="space-y-4">
          <div className="pill mx-auto flex items-center gap-2">
            <SparklesIcon className="w-3 h-3" />
            Members Only Media Channel
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-accent to-accentSoft bg-clip-text text-transparent">
            Elite Bodybuilding Content
          </h1>
          <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto">
            Exclusive training breakdowns, posing tutorials, and prep insights
            powered by our WordPress media channel.
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
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-3 text-sm font-semibold text-slate-950 shadow-soft-glow hover:bg-accent/90 transition transform hover:scale-105"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login to view content
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-700 px-8 py-3 text-sm font-semibold text-slate-100 hover:bg-slate-900/80 transition hover:border-accent/50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Join the club
          </Link>
        </div>
      </div>
    </div>
  );
}

