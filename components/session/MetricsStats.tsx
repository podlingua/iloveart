import { Card } from "@/components/ui/Card";
import { AnalysisMetrics } from "@/lib/types/analysis";

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
  return (
    <Card className="flex flex-col gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        Your numbers
      </span>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat
          label="Time to main point"
          value={
            metrics.time_to_point_seconds === null ? "—" : `${metrics.time_to_point_seconds}s`
          }
        />
        <Stat
          label="Speaking pace"
          value={metrics.speaking_pace_wpm === null ? "—" : `${metrics.speaking_pace_wpm} wpm`}
        />
        <Stat label="Filler words" value={String(metrics.filler_word_count)} />
        <Stat label="Stutters / repeated words" value={String(metrics.stutter_count)} />
        <Stat label="Repeated ideas" value={String(metrics.repetition_count)} />
        <Stat label="Restarts" value={String(metrics.restart_count)} />
      </div>
      <p className="text-xs text-zinc-400">
        Stutters here means word/sound repetitions visible in the transcript (like &ldquo;I- I-
        I think&rdquo;), not a clinical stuttering assessment.
      </p>
    </Card>
  );
}
