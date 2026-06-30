import { NextResponse } from 'next/server';
import { redirect } from 'next/navigation';

import { isAdmin } from '@/lib/auth/roles';
import { getSessionUser } from '@/lib/auth/session';

export async function getAdminUser() {
  const user = await getSessionUser();
  if (!user || !isAdmin(user.roles)) return null;
  return user;
}

export async function requireAdminApi() {
  const user = await getSessionUser();
  if (!user) {
    return { error: NextResponse.json({ message: 'Unauthorized' }, { status: 401 }) };
  }
  if (!isAdmin(user.roles)) {
    return { error: NextResponse.json({ message: 'Forbidden' }, { status: 403 }) };
  }
  return { user };
}

export async function requireAdminPage(redirectTo = '/dashboard/courses') {
  const user = await getSessionUser();
  if (!user) redirect(`/login?from=${encodeURIComponent(redirectTo)}`);
  if (!isAdmin(user.roles)) redirect('/dashboard');
  return user;
}
