"use client";

import { Card } from "@/components/ui/Card";
import { ComparisonResult, ComparisonVerdict } from "@/lib/types/analysis";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const VERDICT_STYLES: Record<ComparisonVerdict, string> = {
  improved: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  same: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400",
  regressed: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
};

interface ComparisonViewProps {
  comparison: ComparisonResult;
}

export function ComparisonView({ comparison }: ComparisonViewProps) {
  const { t } = useLanguage();
  const dimensionLabels = t.comparison.dimensions;
  const verdictLabels = t.comparison.verdicts;

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {t.comparison.heading}
        </span>
        <p className="text-lg leading-relaxed text-zinc-800 dark:text-zinc-200">
          {comparison.summary}
        </p>
      </Card>

      <Card className="flex flex-col gap-3">
        {(Object.keys(dimensionLabels) as Array<keyof ComparisonResult["dimensions"]>).map(
          (key) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {dimensionLabels[key]}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${VERDICT_STYLES[comparison.dimensions[key]]}`}
              >
                {verdictLabels[comparison.dimensions[key]]}
              </span>
            </div>
          )
        )}
      </Card>
    </div>
  );
}
