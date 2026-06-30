import { redirect } from 'next/navigation';

import { hasAppAccess } from '@/lib/auth/roles';
import { getSessionUser } from '@/lib/auth/session';

export async function requireLearnerPage(redirectTo = '/learn') {
  const user = await getSessionUser();
  if (!user) redirect(`/login?from=${encodeURIComponent(redirectTo)}`);
  if (!hasAppAccess(user.roles)) redirect('/login');
  return user;
}
