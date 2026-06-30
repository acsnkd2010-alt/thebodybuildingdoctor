import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';

import { isMediaChannelOnly } from '@/lib/auth/roles';
import { getSessionUser } from '@/lib/auth/session';

export default async function ProfileLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (user && isMediaChannelOnly(user.roles)) {
    redirect('/dashboard');
  }
  return children;
}
