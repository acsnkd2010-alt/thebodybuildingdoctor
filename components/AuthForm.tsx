'use client';

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  getRedirectResult,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  updateProfile,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { auth } from '@/lib/firebase/client';
import { getAuthErrorMessage } from '@/lib/firebase/auth-errors';
import { APP_LOGO_PATH, APP_NAME } from '@/lib/branding';

import Toast from './Toast';

type Mode = 'login' | 'register';

function shouldPreferRedirect() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const isInAppBrowser = /FBAN|FBAV|Instagram|Line\//i.test(ua);
  return isMobile || isInAppBrowser;
}

function isPopupFailure(error: unknown) {
  if (!error || typeof error !== 'object' || !('code' in error)) return false;
  const code = String(error.code);
  return (
    code === 'auth/popup-blocked' ||
    code === 'auth/cancelled-popup-request' ||
    code === 'auth/operation-not-supported-in-this-environment'
  );
}

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

  async function finishSignIn(idToken: string, successMessage: string) {
    await createSession(idToken);
    setToast({ message: successMessage, type: 'success' });
    setTimeout(() => {
      router.push(redirectTo);
      router.refresh();
    }, 1000);
  }

  useEffect(() => {
    let active = true;

    async function handleRedirectResult() {
      try {
        const result = await getRedirectResult(auth);
        if (!result?.user || !active) return;

        setIsSubmitting(true);
        const idToken = await result.user.getIdToken();
        const successMessage =
          mode === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...';
        await finishSignIn(idToken, successMessage);
      } catch (err: unknown) {
        if (!active) return;
        const errorMessage = getAuthErrorMessage(err);
        setError(errorMessage);
        setToast({ message: errorMessage, type: 'error' });
      } finally {
        if (active) setIsSubmitting(false);
      }
    }

    handleRedirectResult();
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleGoogleSignIn() {
    setIsSubmitting(true);
    setError(null);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      if (shouldPreferRedirect()) {
        await signInWithRedirect(auth, provider);
        return;
      }

      const credential = await signInWithPopup(auth, provider);
      const idToken = await credential.user.getIdToken();
      const successMessage =
        mode === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...';
      await finishSignIn(idToken, successMessage);
    } catch (err: unknown) {
      if (isPopupFailure(err)) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectErr: unknown) {
          const errorMessage = getAuthErrorMessage(redirectErr);
          setError(errorMessage);
          setToast({ message: errorMessage, type: 'error' });
          return;
        }
      }

      const errorMessage = getAuthErrorMessage(err);
      if (errorMessage !== 'Sign-in was cancelled.') {
        setError(errorMessage);
        setToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
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

      const successMessage =
        mode === 'login' ? 'Welcome back! Redirecting...' : 'Account created! Redirecting...';
      await finishSignIn(idToken, successMessage);
    } catch (err: unknown) {
      if (!error) {
        const errorMessage = getAuthErrorMessage(err);
        setError(errorMessage);
        setToast({ message: errorMessage, type: 'error' });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="card-surface w-full max-w-md p-6 md:p-8">
      <div className="flex justify-center mb-6">
        <img
          src={APP_LOGO_PATH}
          alt={APP_NAME}
          width={200}
          height={56}
          className="h-14 w-auto object-contain"
        />
      </div>
      <div className="space-y-1 mb-6">
        <div className="pill w-fit mb-3">
          {mode === 'login' ? 'Members Login' : 'New Member'}
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold">{title}</h1>
        <p className="text-xs md:text-sm text-slate-400">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={handleGoogleSignIn}
        disabled={isSubmitting}
        className="w-full flex items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900 text-sm font-medium py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-slate-800 transition"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isSubmitting ? 'Signing in…' : 'Continue with Google'}
      </button>
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-slate-950 px-2 text-slate-500">or</span>
        </div>
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
          className="w-full rounded-full bg-accent text-white text-sm font-semibold py-2.5 disabled:opacity-60 disabled:cursor-not-allowed hover:bg-accent/90 transition"
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
        By continuing you agree to the club&apos;s members-only terms. Access is limited to
        administrators.
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
