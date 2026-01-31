'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import Toast from '@/components/Toast';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [authChecked, setAuthChecked] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setToast({ message: 'New passwords do not match', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setToast({ message: 'New password must be at least 6 characters', type: 'error' });
      return;
    }
    setIsSubmitting(true);
    setToast(null);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setToast({ message: data.message || 'Failed to change password', type: 'error' });
        return;
      }
      setToast({ message: 'Password updated. You can log in with your new password.', type: 'success' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      router.refresh();
      setTimeout(() => router.push('/profile'), 1500);
    } catch {
      setToast({ message: 'Something went wrong', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then((res) => { if (res.status === 401) router.replace('/login?from=/profile/password'); })
      .finally(() => setAuthChecked(true));
  }, [router]);

  if (!authChecked) {
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
          <h1 className="text-xl font-semibold mb-1">Change password</h1>
          <p className="text-sm text-slate-400 mb-6">Enter your current password and choose a new one</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Current password</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">New password</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="••••••••"
              />
              <p className="text-[11px] text-slate-500 mt-1">At least 6 characters</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Confirm new password</label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-accent text-slate-950 text-sm font-semibold py-2.5 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent/90 transition"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
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
