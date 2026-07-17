"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
  const router = useRouter();
  const [topic, setTopic] = useState("");

  const startCustom = () => {
    if (!topic.trim()) return;
    router.push(`/session?topic=${encodeURIComponent(topic.trim())}`);
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <span className="text-sm font-medium uppercase tracking-wide text-zinc-400">
        Speech Coach
      </span>
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
        Practice speaking with clarity.
      </h1>
      <p className="max-w-md text-zinc-500 dark:text-zinc-400">
        You&apos;ll get a prompt, record a short response, and see it transcribed.
      </p>
      <Link href="/session">
        <Button className="px-10 py-4 text-base">Start Today&apos;s Session</Button>
      </Link>

      <div className="mt-4 flex w-full max-w-sm flex-col gap-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          or talk about your own topic
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startCustom()}
          placeholder="e.g. Why remote work is overrated"
          className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <Button variant="secondary" onClick={startCustom} disabled={!topic.trim()}>
          Start with this topic
        </Button>
      </div>
    </div>
  );
}
