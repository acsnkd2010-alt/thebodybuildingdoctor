'use client';

import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

import DashboardNav from '@/components/DashboardNav';
import LogoutButton from '@/components/LogoutButton';

type MobileNavProps = {
  isAdmin: boolean;
  mediaChannelOnly?: boolean;
  userLabel?: string;
  siteName: string;
};

export default function MobileNav({
  isAdmin,
  mediaChannelOnly = false,
  userLabel,
  siteName,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-slate-700 p-2 text-slate-200 hover:bg-slate-800"
        aria-label="Open menu"
      >
        <Bars3Icon className="w-5 h-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 bottom-0 w-[min(100%,280px)] bg-slate-950 border-r border-slate-800 flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-800">
              <span className="text-sm font-semibold text-slate-100 truncate">{siteName}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-200"
                aria-label="Close menu"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-4">
              <DashboardNav
                isAdmin={isAdmin}
                mediaChannelOnly={mediaChannelOnly}
                userLabel={userLabel}
                onNavigate={() => setOpen(false)}
              />
            </div>
            <div className="px-4 py-4 border-t border-slate-800">
              <LogoutButton />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
