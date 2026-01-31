'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';

export default function ProfileEditPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => {
        if (res.status === 401) {
          router.replace('/login?from=/profile/edit');
          return null;
        }
        return res.ok ? res.json() : null;
      })
      .then((data) => {
        if (data?.user) {
          setName(data.user.name ?? data.user.username ?? '');
          setEmail(data.user.email ?? '');
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() && !email.trim()) return;
    setIsSubmitting(true);
    setToast(null);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() || undefined, email: email.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.message || 'Failed to update', type: 'error' });
        return;
      }
      setToast({ message: 'Profile updated', type: 'success' });
      router.refresh();
      setTimeout(() => router.push('/profile'), 1000);
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-sm text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-full overflow-y-auto px-4 md:px-8 py-6 md:py-10">
      <div className="max-w-md mx-auto">
        <Link
          href="/profile"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 mb-6 transition"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to profile
        </Link>
        <div className="card-surface p-6 md:p-8 rounded-2xl">
          <h1 className="text-xl font-semibold mb-1">Edit profile</h1>
          <p className="text-sm text-slate-400 mb-6">Update your name and email</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || (!name.trim() && !email.trim())}
              className="w-full rounded-full bg-accent text-slate-950 text-sm font-semibold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
