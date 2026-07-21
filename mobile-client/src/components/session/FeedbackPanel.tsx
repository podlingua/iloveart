
import { ImpactStyle } from "@capacitor/haptics";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StructureDiagram } from "@/components/session/StructureDiagram";
import { MetricsStats } from "@/components/session/MetricsStats";
import { SpeechAnalysis } from "@/lib/types/analysis";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { hapticImpact } from "@/lib/native/haptics";

interface FeedbackPanelProps {
  analysis: SpeechAnalysis;
  confirmedMeaning: boolean | null;
  onConfirm: (confirmed: boolean) => void;
}

export function FeedbackPanel({ analysis, confirmedMeaning, onConfirm }: FeedbackPanelProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.feedback.whatIThinkYouMeant}
        </span>
        <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.main_point_summary}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {t.feedback.isThisWhatYouMeant}
          </span>
          <Button
            variant={confirmedMeaning === true ? "primary" : "secondary"}
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              onConfirm(true);
            }}
          >
            {t.feedback.yes}
          </Button>
          <Button
            variant={confirmedMeaning === false ? "primary" : "secondary"}
            onClick={() => {
              hapticImpact(ImpactStyle.Light);
              onConfirm(false);
            }}
          >
            {t.feedback.notExactly}
          </Button>
        </div>
        {confirmedMeaning === false && (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.feedback.notedGap}</p>
        )}
      </Card>

      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.feedback.answerStructure}
        </span>
        <StructureDiagram
          label={t.feedback.whatHappened}
          beats={analysis.structure_detected}
          tone="detected"
        />
        <StructureDiagram
          label={t.feedback.clearerVersion}
          beats={analysis.structure_suggested}
          tone="suggested"
        />
      </Card>

      <MetricsStats metrics={analysis.metrics} />

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.feedback.strongestSkill}
        </span>
        <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.strongest_skill}
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.feedback.biggestOpportunity}
        </span>
        <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
          {analysis.biggest_weakness}
        </p>
      </Card>
    </div>
  );
}
