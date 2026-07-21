import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

// Plain browser client (session persisted to localStorage by default) - this
// is a pure SPA with no server-side rendering, so the cookie-syncing
// @supabase/ssr helper the Next.js website uses isn't needed here.
export function createClient() {
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
  return createSupabaseClient(supabaseUrl as string, supabaseAnonKey as string);
}
