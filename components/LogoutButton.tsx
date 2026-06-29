'use client';

import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { auth } from '@/lib/firebase/client';

export default function LogoutButton() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      await signOut(auth).catch(() => undefined);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className="block w-full text-left rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800/70 transition disabled:opacity-50"
    >
      {isLoggingOut ? 'Logging out...' : 'Logout'}
    </button>
  );
}
