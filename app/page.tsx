import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Dashboard() {
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
    </div>
  );
}
