// CORS allowlist. Production origins come from a server-only env var (never
// NEXT_PUBLIC_-prefixed, since it's only ever read inside route handlers) so
// they can be changed per-deployment without a code change - e.g. adding the
// Capacitor iOS origin once that project exists, without touching this file.
//
// We deliberately never emit "Access-Control-Allow-Origin: *". Every
// response either echoes back one specific, allowlisted origin or omits the
// CORS headers entirely.

// Capacitor's local WebView origin depends on how the iOS project is
// eventually configured: the default custom scheme is "capacitor://localhost",
// but apps that need full Web API compatibility (this app's getUserMedia-based
// recorder is exactly that case) commonly set `server.iosScheme: "https"`,
// which makes the origin "https://localhost" instead. Both are listed here as
// dev-safe defaults; once the mobile app is actually built, confirm which one
// it uses and add it to ALLOWED_ORIGINS in production.
const DEV_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "capacitor://localhost",
  "https://localhost",
  "ionic://localhost",
];

function configuredOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS;
  if (!raw) return [];
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * Returns the request's Origin header back verbatim if it's allowlisted,
 * otherwise null. Passing the result straight into Access-Control-Allow-Origin
 * is what lets us allow multiple specific origins without ever using "*".
 */
export function resolveAllowedOrigin(requestOrigin: string | null): string | null {
  if (!requestOrigin) return null;
  const allowed = configuredOrigins();
  // Read NODE_ENV fresh on every call rather than caching it at module load:
  // this module is imported once and cached by Node/Vite, so a cached value
  // would freeze whatever NODE_ENV happened to be at first import.
  if (process.env.NODE_ENV !== "production") {
    allowed.push(...DEV_ORIGINS);
  }
  return allowed.includes(requestOrigin) ? requestOrigin : null;
}

export function corsHeaders(allowedOrigin: string | null): Record<string, string> {
  if (!allowedOrigin) return {};
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    Vary: "Origin",
  };
}

export function preflightHeaders(allowedOrigin: string | null): Record<string, string> {
  return {
    ...corsHeaders(allowedOrigin),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
  };
}
