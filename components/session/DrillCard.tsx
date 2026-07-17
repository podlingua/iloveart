"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Drill } from "@/lib/types/analysis";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

interface DrillCardProps {
  drill: Drill;
  onStart: () => void;
}

export function DrillCard({ drill, onStart }: DrillCardProps) {
  const { t } = useLanguage();

  return (
    <Card className="flex flex-col gap-4">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
        {t.drill.yourDrill}
      </span>
      <span className="text-sm font-semibold tracking-wide text-zinc-900 dark:text-zinc-100">
        {drill.label.toUpperCase()}
      </span>
      <p className="text-base leading-relaxed text-zinc-800 dark:text-zinc-200">
        {drill.instructions}
      </p>
      <Button onClick={onStart} className="self-start">
        {t.drill.beginAttempt2}
      </Button>
    </Card>
  );
}
