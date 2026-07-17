"use client";

import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface TranscriptViewProps {
  status: "transcribing" | "done" | "error";
  text?: string;
  error?: string;
}

export function TranscriptView({ status, text, error }: TranscriptViewProps) {
  const { t } = useLanguage();

  if (status === "transcribing") {
    return (
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.transcript.transcribing}</p>
    );
  }

  if (status === "error") {
    return <p className="text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <p className="whitespace-pre-wrap text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
      {text}
    </p>
  );
}
