/** Addresses of each part on the production domain (see README). */
export const DOMAIN = "fatema.beauty";
export const APP_ORIGIN = `https://app.${DOMAIN}`;

const onProduction = () => typeof window !== "undefined" && window.location.hostname.endsWith(DOMAIN);

/** Link to a patient-app page: on fatema.beauty it goes to app.fatema.beauty, elsewhere (preview, local) it stays relative. */
export function appHref(path: string) {
  if (!onProduction()) return path;
  return window.location.hostname === `app.${DOMAIN}` ? path : APP_ORIGIN + path;
}

/** True inside the iOS/Android store app (Capacitor). */
export function isNativeApp() {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}
