// The bundled client is served from its own origin (a Capacitor WebView, or
// this Vite dev/preview server) - it is never same-origin with the Next.js
// deployment that hosts the OpenAI-backed API routes. Every API call must
// therefore go over an absolute URL, and that origin must be present in the
// API's ALLOWED_ORIGINS allowlist (see lib/security/cors.ts on the website).
export const API_BASE_URL: string = (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/+$/, "");

if (!API_BASE_URL && import.meta.env.PROD) {
  console.warn(
    "VITE_API_BASE_URL is not set - API requests will be made to relative paths, which only works if this client is ever served from the same origin as the API."
  );
}

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}
