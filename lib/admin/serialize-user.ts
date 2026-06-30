import type { UserRecord } from 'firebase-admin/auth';

import { parseRoles } from '@/lib/auth/roles';

export type UserProfile = {
  displayName?: string;
  role?: string;
  email?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export function serializeAdminUser(fbUser: UserRecord, profile?: UserProfile | null) {
  const claimRoles = parseRoles(fbUser.customClaims?.roles);
  return {
    uid: fbUser.uid,
    email: fbUser.email ?? profile?.email ?? '',
    displayName: fbUser.displayName ?? profile?.displayName ?? '',
    role: profile?.role ?? 'student',
    roles: claimRoles,
    createdAt: fbUser.metadata.creationTime
      ? new Date(fbUser.metadata.creationTime).toISOString()
      : profile?.createdAt?.toISOString() ?? null,
    lastSignIn: fbUser.metadata.lastSignInTime
      ? new Date(fbUser.metadata.lastSignInTime).toISOString()
      : null,
    disabled: fbUser.disabled,
  };
}

export const ASSIGNABLE_ROLES = [
  'student',
  'media_channel',
  'administrator',
  'admin',
  'lms_manager',
] as const;
