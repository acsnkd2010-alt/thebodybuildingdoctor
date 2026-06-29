/** Roles that may access the media channel web app (Firebase custom claims). */
export const ALLOWED_APP_ROLES = ['media_channel', 'administrator'] as const;

export type AppRole = (typeof ALLOWED_APP_ROLES)[number];

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

export function hasAppAccess(roles: string[]): boolean {
  return roles.some((role) => ALLOWED_APP_ROLES.includes(role as AppRole));
}

export function primaryAppRole(roles: string[]): string | undefined {
  return roles.find((role) => ALLOWED_APP_ROLES.includes(role as AppRole));
}
