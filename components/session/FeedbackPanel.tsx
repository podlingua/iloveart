import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StructureDiagram } from "@/components/session/StructureDiagram";
import { MetricsStats } from "@/components/session/MetricsStats";
import { SpeechAnalysis } from "@/lib/types/analysis";

interface FeedbackPanelProps {
  analysis: SpeechAnalysis;
  confirmedMeaning: boolean | null;
  onConfirm: (confirmed: boolean) => void;
}

export function FeedbackPanel({ analysis, confirmedMeaning, onConfirm }: FeedbackPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          What I think you meant
        </span>
        <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.main_point_summary}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            Is this what you were trying to say?
          </span>
          <Button
            variant={confirmedMeaning === true ? "primary" : "secondary"}
            onClick={() => onConfirm(true)}
          >
            Yes
          </Button>
          <Button
            variant={confirmedMeaning === false ? "primary" : "secondary"}
            onClick={() => onConfirm(false)}
          >
            Not exactly
          </Button>
        </div>
        {confirmedMeaning === false && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Noted. Keep that gap in mind for your next attempt.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Your answer structure
        </span>
        <StructureDiagram label="What happened" beats={analysis.structure_detected} tone="detected" />
        <StructureDiagram
          label="A clearer version"
          beats={analysis.structure_suggested}
          tone="suggested"
        />
      </Card>

      <MetricsStats metrics={analysis.metrics} />

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Your strongest skill
        </span>
        <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.strongest_skill}
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Your biggest opportunity
        </span>
        <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.biggest_weakness}
        </p>
      </Card>
    </div>
  );
}
