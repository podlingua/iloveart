"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { listSessions, SessionHistoryRow } from "@/lib/db/sessions";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const [sessions, setSessions] = useState<SessionHistoryRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;
    listSessions(user.id)
      .then(setSessions)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load history."));
  }, [user]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Your sessions</h1>

      {!isSupabaseConfigured && (
        <Card>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            History requires Supabase to be configured for this app.
          </p>
        </Card>
      )}

      {isSupabaseConfigured && loading && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading&hellip;</p>
      )}

      {isSupabaseConfigured && !loading && user?.is_anonymous && (
        <Card className="flex flex-col gap-3">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Save your progress to keep your session history across visits.
          </p>
          <Link href="/save-progress">
            <Button variant="secondary">Save your progress</Button>
          </Link>
        </Card>
      )}

      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      {sessions && sessions.length === 0 && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          No sessions yet. Start your first one from the dashboard.
        </p>
      )}

      {sessions && sessions.length > 0 && (
        <div className="flex flex-col gap-3">
          {sessions.map((session) => (
            <Card key={session.id} className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-sm text-zinc-800 dark:text-zinc-200">
                  {session.prompts?.text ?? "Prompt"}
                </span>
                <span className="text-xs text-zinc-400">{formatDate(session.created_at)}</span>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  session.status === "completed"
                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                }`}
              >
                {session.status === "completed" ? "Completed" : "In progress"}
              </span>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
