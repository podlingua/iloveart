"use client";

import { Card } from "@/components/ui/Card";
import { AnalysisMetrics } from "@/lib/types/analysis";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface MetricsStatsProps {
  metrics: AnalysisMetrics;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-2xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {value}
      </span>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{label}</span>
    </div>
  );
}

export function MetricsStats({ metrics }: MetricsStatsProps) {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {t.metrics.yourNumbers}
      </span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat
          label={t.metrics.timeToMainPoint}
          value={
            metrics.time_to_point_seconds === null ? "—" : `${metrics.time_to_point_seconds}s`
          }
        />
        <Stat
          label={t.metrics.speakingPace}
          value={
            metrics.speaking_pace_wpm === null
              ? "—"
              : `${metrics.speaking_pace_wpm} ${t.metrics.paceUnit}`
          }
        />
        <Stat label={t.metrics.fillerWords} value={String(metrics.filler_word_count)} />
        <Stat label={t.metrics.stutters} value={String(metrics.stutter_count)} />
        <Stat label={t.metrics.repeatedIdeas} value={String(metrics.repetition_count)} />
        <Stat label={t.metrics.restarts} value={String(metrics.restart_count)} />
      </div>
      <p className="text-xs text-zinc-400">{t.metrics.disclaimer}</p>
    </Card>
  );
}
