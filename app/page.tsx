"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getStructureGroups } from "@/lib/prompts/structures";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Dashboard() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [topic, setTopic] = useState("");
  const [structureId, setStructureId] = useState("auto");

  const structureGroups = getStructureGroups(lang);

  const buildSessionUrl = (topicText?: string) => {
    const params = new URLSearchParams();
    if (topicText) params.set("topic", topicText);
    if (structureId !== "auto") params.set("structure", structureId);
    const query = params.toString();
    return query ? `/session?${query}` : "/session";
  };

  const startRandom = () => router.push(buildSessionUrl());

  const startCustom = () => {
    if (!topic.trim()) return;
    router.push(buildSessionUrl(topic.trim()));
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
      <span className="text-sm font-medium uppercase tracking-wide text-zinc-400">
        {t.dashboard.eyebrow}
      </span>
      <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100">
        {t.dashboard.title}
      </h1>
      <p className="max-w-md text-zinc-500 dark:text-zinc-400">{t.dashboard.subtitle}</p>

      <div className="flex w-full max-w-sm flex-col gap-2 text-left">
        <label className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.dashboard.structureLabel}
        </label>
        <select
          value={structureId}
          onChange={(e) => setStructureId(e.target.value)}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        >
          {structureGroups.map((g) =>
            g.group === "Default" ? (
              g.options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))
            ) : (
              <optgroup key={g.group} label={g.group}>
                {g.options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </optgroup>
            )
          )}
        </select>
      </div>

      <Button className="px-10 py-4 text-base" onClick={startRandom}>
        {t.dashboard.startSession}
      </Button>

      <div className="mt-4 flex w-full max-w-sm flex-col gap-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          {t.dashboard.orOwnTopic}
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startCustom()}
          placeholder={t.dashboard.topicPlaceholder}
          className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
        <Button variant="secondary" onClick={startCustom} disabled={!topic.trim()}>
          {t.dashboard.startWithTopic}
        </Button>
      </div>
    </div>
  );
}
