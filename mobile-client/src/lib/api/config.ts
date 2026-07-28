// The bundled client is served from its own origin (a Capacitor WebView, or
// this Vite dev/preview server) - it is never same-origin with the Next.js
// deployment that hosts the OpenAI-backed API routes. Every API call must
// therefore go over an absolute URL, and that origin must be present in the
// API's ALLOWED_ORIGINS allowlist (see lib/security/cors.ts on the website).
//
// BUG HISTORY: this used to silently fall back to "" (an empty base), which
// made apiUrl() return a *relative* path like "/api/transcribe". In a plain
// browser that is merely wrong; inside a Capacitor iOS WKWebView using the
// "https" scheme, the app is served through a custom WKURLSchemeHandler at
// https://localhost rather than a real HTTPS server, and WebKit's URL
// resolver can fail to resolve a relative fetch() target against that
// synthetic origin - it throws synchronously with
// `TypeError: The string did not match the expected pattern.` instead of a
// normal network error. That is the exact bug reported after stop-recording
// on a real iPhone: VITE_API_BASE_URL was never set, so every fetch() call
// received a relative URL and WebKit rejected it outright before any request
// was even attempted.
//
// Fix: validate lazily (the first time a request is actually about to be
// made, inside apiUrl()) and fail with a clear, actionable error instead of
// silently building a URL that will break inside a native WebView. This is
// deliberately lazy rather than a module-load-time throw, so pages that
// don't call the API (dashboard, history, sign-in) still render even if the
// API base URL is misconfigured.
const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
console.log("[config] VITE_API_BASE_URL raw value:", JSON.stringify(rawApiBaseUrl));

export const API_BASE_URL: string = (rawApiBaseUrl ?? "").trim().replace(/\/+$/, "");

console.log(
  "[config] Resolved API_BASE_URL:",
  API_BASE_URL || "(empty - relative paths will be used, which do NOT work in the Capacitor iOS app)"
);

function assertValidAbsoluteUrl(candidate: string): URL {
  if (!candidate) {
    throw new Error(
      "VITE_API_BASE_URL is not set. Set it in mobile-client/.env to the absolute URL of the deployed " +
        "API (e.g. https://your-deployed-site.example.com), then rebuild (npm run build) and re-sync " +
        "(npx cap sync ios). A relative path cannot reliably reach the API from inside a Capacitor WebView."
    );
  }
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(`unsupported protocol "${parsed.protocol}"`);
    }
    return parsed;
  } catch (err) {
    throw new Error(
      `VITE_API_BASE_URL is set to an invalid absolute URL (${JSON.stringify(candidate)}). It must ` +
        `include the scheme, e.g. "https://your-deployed-site.example.com". Original error: ${
          err instanceof Error ? err.message : String(err)
        }`
    );
  }
}

export function apiUrl(path: string): string {
  // Validate the base URL itself first, so a missing/malformed env var
  // produces our clear message rather than a cryptic native one.
  assertValidAbsoluteUrl(API_BASE_URL);

  const url = `${API_BASE_URL}${path}`;
  // Then validate the final constructed URL before ever handing it to
  // fetch() - this is what converts WebKit's opaque
  // "The string did not match the expected pattern." into a diagnosable error.
  try {
    new URL(url);
  } catch (err) {
    throw new Error(
      `apiUrl() built an invalid URL: ${JSON.stringify(url)} (base=${JSON.stringify(
        API_BASE_URL
      )}, path=${JSON.stringify(path)}). Original error: ${
        err instanceof Error ? err.message : String(err)
      }`
    );
  }
  console.log("[api] Request URL:", url);
  return url;
}
