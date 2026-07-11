import { Card } from "@/components/ui/Card";
import { ComparisonResult, ComparisonVerdict } from "@/lib/types/analysis";

const DIMENSION_LABELS: Record<keyof ComparisonResult["dimensions"], string> = {
  time_to_point: "Time to main point",
  filler_words: "Filler words",
  repetition: "Repetition",
  structure: "Answer structure",
  conciseness: "Conciseness",
  use_of_examples: "Use of examples",
  conclusion_clarity: "Clarity of conclusion",
  speaking_pace: "Speaking pace",
};

const VERDICT_STYLES: Record<ComparisonVerdict, string> = {
  improved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  same: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  regressed: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

const VERDICT_LABELS: Record<ComparisonVerdict, string> = {
  improved: "Improved",
  same: "About the same",
  regressed: "Regressed",
};

interface ComparisonViewProps {
  comparison: ComparisonResult;
}

export function ComparisonView({ comparison }: ComparisonViewProps) {
  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Attempt 1 vs. Attempt 2
        </span>
        <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
          {comparison.summary}
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        {(Object.keys(DIMENSION_LABELS) as Array<keyof ComparisonResult["dimensions"]>).map(
          (key) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {DIMENSION_LABELS[key]}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${VERDICT_STYLES[comparison.dimensions[key]]}`}
              >
                {VERDICT_LABELS[comparison.dimensions[key]]}
              </span>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
