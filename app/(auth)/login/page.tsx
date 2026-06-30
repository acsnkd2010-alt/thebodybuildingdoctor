import { Suspense } from 'react';

import AuthForm from '@/components/AuthForm';

export const metadata = {
  title: 'Login | Bodybuilding Media Channel',
};

export default function LoginPage() {
  return (
    <div className="flex h-full items-center justify-center px-4 py-10">
      <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
        <AuthForm mode="login" />
      </Suspense>
    </div>
  );
}
