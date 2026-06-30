'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  HomeIcon,
  NewspaperIcon,
  UserGroupIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

type DashboardNavProps = {
  isAdmin: boolean;
  userLabel?: string;
  onNavigate?: () => void;
};

const mainLinks = [
  { href: '/dashboard', label: 'News & Articles', icon: HomeIcon, match: (path: string) => path === '/dashboard' || path.startsWith('/dashboard/articles') },
  { href: '/profile', label: 'Profile', icon: UserIcon, match: (path: string) => path.startsWith('/profile') },
];

const adminLinks = [
  { href: '/dashboard/courses', label: 'Courses', icon: AcademicCapIcon },
  { href: '/dashboard/enrollments', label: 'Enrollments', icon: UserGroupIcon },
  { href: '/dashboard/blogs', label: 'Blogs', icon: NewspaperIcon },
  { href: '/dashboard/blog-access', label: 'Blog access', icon: DocumentTextIcon },
  { href: '/dashboard/users', label: 'Users', icon: UsersIcon },
];

function linkClass(active: boolean) {
  return `flex items-center gap-2 rounded-lg px-3 py-2 transition ${
    active
      ? 'bg-accent text-white font-medium'
      : 'text-slate-200 hover:bg-slate-800/70'
  }`;
}

export default function DashboardNav({ isAdmin, userLabel, onNavigate }: DashboardNavProps) {
  const pathname = usePathname();

  function isActive(href: string, match?: (path: string) => boolean) {
    if (match) return match(pathname);
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <nav className="space-y-1 text-sm">
      <div className="px-3 py-2 mb-2 text-xs text-slate-500 uppercase tracking-wide">Menu</div>
      {mainLinks.map(({ href, label, icon: Icon, match }) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          className={linkClass(isActive(href, match))}
        >
          <Icon className="w-4 h-4 shrink-0" />
          {label}
        </Link>
      ))}

      {isAdmin && (
        <>
          <div className="px-3 py-2 mt-4 mb-2 text-xs text-slate-500 uppercase tracking-wide">
            Admin
          </div>
          {adminLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={linkClass(isActive(href))}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
        </>
      )}

      {userLabel && (
        <div className="pt-4 mt-4 border-t border-slate-800">
          <div className="px-3 py-2 mb-2 text-xs text-slate-500 truncate">{userLabel}</div>
        </div>
      )}
    </nav>
  );
}
