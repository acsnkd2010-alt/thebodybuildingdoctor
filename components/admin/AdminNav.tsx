'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  AcademicCapIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  NewspaperIcon,
  UserGroupIcon,
  UsersIcon,
} from '@heroicons/react/24/outline';

const links = [
  { href: '/dashboard/courses', label: 'Courses', icon: AcademicCapIcon },
  { href: '/dashboard/inquiries', label: 'Inquiries', icon: EnvelopeIcon },
  { href: '/dashboard/enrollments', label: 'Enrollments', icon: UserGroupIcon },
  { href: '/dashboard/blogs', label: 'Blogs', icon: NewspaperIcon },
  { href: '/dashboard/blog-access', label: 'Blog access', icon: DocumentTextIcon },
  { href: '/dashboard/users', label: 'Users', icon: UsersIcon },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="mb-8 space-y-4">
      <div>
        <div className="pill w-fit mb-2">Course Admin</div>
        <h1 className="text-2xl font-semibold text-slate-100">Manage courses & access</h1>
        <p className="text-sm text-slate-400 mt-1">
          Manage users, courses, lessons, enrollments, and blogs.
        </p>
      </div>
      <nav className="flex flex-wrap gap-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? 'bg-accent text-white'
                  : 'bg-slate-900/80 text-slate-300 border border-slate-700 hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
