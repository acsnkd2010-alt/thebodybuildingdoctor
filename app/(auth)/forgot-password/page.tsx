'use client';

import { sendPasswordResetEmail } from 'firebase/auth';
import { useState } from 'react';
import Link from 'next/link';

import { auth } from '@/lib/firebase/client';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/auth-errors';

import Toast from '@/components/Toast';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setIsSubmitting(true);
    setToast(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSent(true);
      setToast({
        message: 'If an account exists for this email, you will receive a reset link.',
        type: 'success',
      });
    } catch (error) {
      setToast({ message: getFirebaseAuthErrorMessage(error), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <div className="card-surface w-full max-w-md p-6 md:p-8">
        <div className="space-y-1 mb-6">
          <div className="pill w-fit mb-3">Reset password</div>
          <h1 className="text-2xl md:text-3xl font-semibold">Forgot password?</h1>
          <p className="text-xs md:text-sm text-slate-400">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {sent ? (
          <div className="space-y-4">
            <p className="text-sm text-slate-300">
              Check your inbox for a password reset link. If you don&apos;t see it, check spam.
            </p>
            <Link
              href="/login"
              className="block w-full text-center rounded-full border border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-800/80 transition"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-accent text-white text-sm font-semibold py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-accent/90 transition"
            >
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="mt-6 text-center">
          <Link href="/login" className="text-sm text-slate-400 hover:text-slate-200 transition">
            Back to login
          </Link>
        </p>
      </div>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
}
