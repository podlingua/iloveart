"use client";

import Link from "next/link";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="mx-auto flex w-full max-w-2xl items-center justify-between px-6 py-6">
      <Link href="/" className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
        Speech Coach
      </Link>

      {isSupabaseConfigured && !loading && (
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/history" className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            History
          </Link>

          {user && !user.is_anonymous && (
            <>
              <span className="text-zinc-400">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign out
              </button>
            </>
          )}

          {user && user.is_anonymous && (
            <>
              <Link
                href="/save-progress"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Save your progress
              </Link>
              <Link
                href="/sign-in"
                className="text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
              >
                Sign in
              </Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
