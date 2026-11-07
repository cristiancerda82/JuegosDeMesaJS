/**
 * ¿Corre la app dentro de la app nativa (Capacitor)? Capacitor inyecta el objeto global
 * `Capacitor` en su WebView; en el navegador no existe.
 */
export function esNativa(): boolean {
  const capacitor = (globalThis as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return capacitor?.isNativePlatform?.() ?? false;
}
