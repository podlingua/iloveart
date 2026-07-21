import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export interface VerifiedUser {
  id: string;
}

/**
 * Verifies the request's `Authorization: Bearer <token>` header against
 * Supabase and returns the authenticated user's id, derived only from the
 * token itself - never from anything in the request body.
 *
 * Returns null for a missing header, a malformed header, or a token that
 * Supabase rejects (invalid signature, revoked, or expired). Callers should
 * treat null as "respond 401".
 *
 * Uses the anon key, not the service role key - verifying a user's own token
 * is a least-privilege operation and doesn't need admin access.
 */
export async function verifyBearerToken(req: NextRequest): Promise<VerifiedUser | null> {
  if (!isSupabaseConfigured) return null;

  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) return null;

  const supabase = createClient(supabaseUrl as string, supabaseAnonKey as string, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return { id: data.user.id };
}
