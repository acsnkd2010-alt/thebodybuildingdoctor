export const APP_NAME = 'The Bodybuilding Doctor';
export const APP_LOGO_PATH = '/logo.png';

export function resolveLogoUrl(wordpressLogoUrl?: string | null) {
  return wordpressLogoUrl?.trim() || APP_LOGO_PATH;
}
