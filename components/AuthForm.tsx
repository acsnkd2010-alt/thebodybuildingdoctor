'use client';

import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { auth } from '@/lib/firebase/client';
import { getFirebaseAuthErrorMessage } from '@/lib/firebase/auth-errors';

import Toast from './Toast';

type Mode = 'login' | 'register';

export default function AuthForm({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const redirectTo = params.get('from') || '/dashboard';

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const title = mode === 'login' ? 'Welcome back' : 'Join the media club';
  const subtitle =
    mode === 'login'
      ? 'Log in to unlock members-only bodybuilding content.'
      : 'Create your account to access the full media channel.';

  async function createSession(idToken: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const errorMessage = data.message || 'Something went wrong';
      setError(errorMessage);
      setToast({ message: errorMessage, type: 'error' });
      throw new Error(errorMessage);
    }

    return res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let idToken: string;

      if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
        idToken = await credential.user.getIdToken();
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (username.trim()) {
          await updateProfile(credential.user, { displayName: username.trim() });
        }
        idToken = await credential.user.getIdToken();
      }

      await createSession(idToken);

      setToast({
        message: mode === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...',
        type: 'success',
      });

      setTimeout(() => {
        router.push(redirectTo);
        router.refresh();
      }, 1000);
    } catch (err: unknown) {
      if (!error) {
        const errorMessage = getFirebaseAuthErrorMessage(err);
        setError(errorMessage);
        setToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card-surface w-full max-w-md p-6 md:p-8">
      <div className="space-y-1 mb-6">
        <div className="pill w-fit mb-3">
          {mode === 'login' ? 'Members Login' : 'New Member'}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
        <p className="text-xs md:text-sm text-slate-400">{subtitle}</p>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === 'register' && (
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-300">Display name</label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
            />
          </div>
        )}
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300" htmlFor="login-id">
            Email
          </label>
          <input
            id="login-id"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300" htmlFor="login-password">Password</label>
          <input
            id="login-password"
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-slate-900 border border-slate-700 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/70"
          />
        </div>
        {error && (
          <p className="text-xs text-red-400 bg-red-950/50 border border-red-900 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-full bg-accent text-slate-950 text-sm font-semibold py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-accent/90 transition"
        >
          {isSubmitting
            ? mode === 'login'
              ? 'Logging in...'
              : 'Creating account...'
            : mode === 'login'
            ? 'Login'
            : 'Create account'}
        </button>
        {mode === 'login' && (
          <p className="text-center text-sm text-slate-400">
            <a href="/forgot-password" className="text-accent hover:underline">
              Forgot password?
            </a>
          </p>
        )}
      </form>
      <p className="mt-4 text-[11px] text-slate-500">
        By continuing you agree to the club&apos;s members-only terms. Access requires a Media
        Channel or administrator role on your Firebase account.
      </p>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
