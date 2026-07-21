import { NextRequest, NextResponse } from "next/server";
import { corsHeaders, preflightHeaders, resolveAllowedOrigin } from "@/lib/security/cors";
import { verifyBearerToken } from "@/lib/security/auth";
import { getRateLimiter } from "@/lib/security/rateLimit";

interface GuardOptions {
  rateLimit?: { limit: number; windowMs: number };
}

export interface GuardContext {
  userId: string;
  headers: Record<string, string>;
}

/**
 * Runs the shared request-security pipeline for a protected route:
 *   1. Reject disallowed cross-origin callers (CORS allowlist).
 *   2. Require and verify a Supabase bearer token (401 if missing/invalid/expired).
 *   3. Enforce a per-user rate limit, if configured (429 if exceeded).
 *
 * On success, returns { userId, headers } - userId comes only from the
 * verified token, never from the request body, and headers must be attached
 * to every response so browsers can read it cross-origin. On failure,
 * returns a NextResponse the caller should return directly.
 */
export async function guardRequest(
  req: NextRequest,
  options: GuardOptions = {}
): Promise<GuardContext | NextResponse> {
  const origin = req.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(origin);

  if (origin && !allowedOrigin) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }

  const headers = corsHeaders(allowedOrigin);

  const user = await verifyBearerToken(req);
  if (!user) {
    return NextResponse.json(
      { error: "Missing or invalid access token." },
      { status: 401, headers }
    );
  }

  if (options.rateLimit) {
    const result = await getRateLimiter().check(
      user.id,
      options.rateLimit.limit,
      options.rateLimit.windowMs
    );
    if (!result.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Please slow down and try again shortly." },
        {
          status: 429,
          headers: {
            ...headers,
            "Retry-After": String(Math.max(1, Math.ceil((result.resetAt - Date.now()) / 1000))),
          },
        }
      );
    }
  }

  return { userId: user.id, headers };
}

export function handlePreflight(req: NextRequest): NextResponse {
  const origin = req.headers.get("origin");
  const allowedOrigin = resolveAllowedOrigin(origin);

  if (origin && !allowedOrigin) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, { status: 204, headers: preflightHeaders(allowedOrigin) });
}
