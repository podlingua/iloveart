"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/lib/supabase/AuthProvider";

export default function SaveProgressPage() {
  const { user, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ email, password });

      if (updateError) {
        setError(updateError.message);
        setStatus("error");
        return;
      }

      setStatus("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Saving progress failed.");
      setStatus("error");
    }
  };

  if (loading) return null;

  if (user && !user.is_anonymous) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 py-12 text-center">
        <p className="text-zinc-600 dark:text-zinc-400">
          Your progress is already saved to {user.email}.
        </p>
        <Link href="/">
          <Button variant="secondary">Back to dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-6 px-6 py-12">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Save your progress
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Add an email and password so your session history is here next time you visit.
        </p>
      </div>

      <Card>
        {status === "sent" ? (
          <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
            We sent a confirmation link to {email}. Click it to finish saving your progress.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <input
              type="password"
              required
              minLength={6}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Saving…" : "Save progress"}
            </Button>
          </form>
        )}
      </Card>

      <Link href="/sign-in" className="text-center text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
        Already have an account? Sign in
      </Link>
    </div>
  );
}
