import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { supabaseUrl } from "@/lib/supabase/config";

let client: SupabaseClient | null = null;

/**
 * Server-only Supabase client using the service role key. This bypasses
 * Row Level Security entirely, so it must never run anywhere reachable from
 * the browser or be constructed with a user-supplied id trusted as-is - only
 * call this after a request has already been through verifyBearerToken.
 *
 * The service role key itself is never exported from this module - only a
 * client built from it is, so there is no way for a caller to read the raw
 * secret out of this file.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Server is missing SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_URL."
    );
  }
  if (!client) {
    client = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
