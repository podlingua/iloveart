"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getStructureGroups } from "@/lib/prompts/structures";
import { saveSource } from "@/lib/prompts/sourceStorage";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function Dashboard() {
  const router = useRouter();
  const { lang, t } = useLanguage();
  const [topic, setTopic] = useState("");
  const [structureId, setStructureId] = useState("auto");
  const [factCheckEnabled, setFactCheckEnabled] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const structureGroups = getStructureGroups(lang);

  const buildSessionUrl = (extraParams?: Record<string, string>) => {
    const params = new URLSearchParams(extraParams);
    if (structureId !== "auto") params.set("structure", structureId);
    if (factCheckEnabled) params.set("factcheck", "1");
    const query = params.toString();
    return query ? `/session?${query}` : "/session";
  };

  const startRandom = () => router.push(buildSessionUrl());

  const startCustom = () => {
    if (!topic.trim()) return;
    router.push(buildSessionUrl({ topic: topic.trim() }));
  };

  const handleFileSelected = async (file: File) => {
    setUploading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("lang", lang);
      const res = await fetch("/api/extract-source", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t.dashboard.uploadError);
      saveSource(data.source);
      router.push(buildSessionUrl({ source: "1" }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : t.dashboard.uploadError);
      setUploading(false);
    }
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

      <label className="flex w-full max-w-sm items-center gap-2 text-left text-sm text-zinc-600 dark:text-zinc-400">
        <input
          type="checkbox"
          checked={factCheckEnabled}
          onChange={(e) => setFactCheckEnabled(e.target.checked)}
          className="h-4 w-4 rounded border-zinc-300 dark:border-zinc-700"
        />
        {t.dashboard.factCheckToggle}
      </label>

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

      <div className="flex w-full max-w-sm flex-col gap-3">
        <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-zinc-400">
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
          {t.dashboard.orUploadFile}
          <span className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800" />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/gif,application/pdf"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) handleFileSelected(file);
          }}
        />
        {uploadError && <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>}
        <Button
          variant="secondary"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? t.dashboard.uploading : t.dashboard.uploadFile}
        </Button>
      </div>
    </div>
  );
}
