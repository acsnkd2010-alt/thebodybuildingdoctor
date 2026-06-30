/** Roles that may sign in to the web admin app. */
export const ADMIN_ROLES = ['administrator', 'admin', 'lms_manager'] as const;

/** Firebase roles that grant web app access to the media channel (news & articles only). */
export const MEDIA_CHANNEL_ROLES = ['media_channel'] as const;

/** Firebase roles that grant mobile blog access without an explicit blog_access grant. */
export const BLOG_ACCESS_ROLES = MEDIA_CHANNEL_ROLES;

/** @deprecated Use ADMIN_ROLES — web login is admin-only. */
export const ALLOWED_APP_ROLES = ADMIN_ROLES;

export type AdminRole = (typeof ADMIN_ROLES)[number];

export function parseRoles(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map(String).filter(Boolean);
  if (typeof raw === 'string') {
    return raw
      .split(',')
      .map((role) => role.trim())
      .filter(Boolean);
  }
  return [];
}

export function isAdmin(roles: string[]): boolean {
  return roles.some((role) => ADMIN_ROLES.includes(role as AdminRole));
}

export function isMediaChannel(roles: string[]): boolean {
  return roles.some((role) =>
    MEDIA_CHANNEL_ROLES.includes(role as (typeof MEDIA_CHANNEL_ROLES)[number]),
  );
}

/** Signed-in media_channel users without an admin role — news & articles menu only. */
export function isMediaChannelOnly(roles: string[]): boolean {
  return isMediaChannel(roles) && !isAdmin(roles);
}

export function hasAppAccess(roles: string[]): boolean {
  return isAdmin(roles) || isMediaChannel(roles);
}

export function primaryAppRole(roles: string[]): string | undefined {
  const adminRole = roles.find((role) => ADMIN_ROLES.includes(role as AdminRole));
  if (adminRole) return adminRole;
  if (isMediaChannel(roles)) return 'media_channel';
  return undefined;
}

export function hasBlogRoleAccess(roles: string[]): boolean {
  return isMediaChannel(roles);
}
