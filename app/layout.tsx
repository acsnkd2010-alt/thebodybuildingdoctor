import './globals.css';
import type { ReactNode } from 'react';
import type { Metadata } from 'next';

import { getSiteInfo } from '../lib/wordpress';
import { APP_LOGO_PATH, APP_NAME } from '../lib/branding';

export async function generateMetadata(): Promise<Metadata> {
  const siteInfo = await getSiteInfo();
  const title = siteInfo.site_name || APP_NAME;
  const description =
    siteInfo.site_description ||
    'Evidence-based bodybuilding coaching, online courses, and mentorship from The Bodybuilding Doctor.';
  const keywords = siteInfo.site_keywords
    ? siteInfo.site_keywords.split(/[\s,]+/).filter(Boolean)
    : undefined;
  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    keywords: keywords?.length ? keywords : undefined,
    icons: {
      icon: APP_LOGO_PATH,
      apple: APP_LOGO_PATH,
    },
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-screen bg-background text-slate-100">{children}</body>
    </html>
  );
}
