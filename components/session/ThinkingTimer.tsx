"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

const THINKING_SECONDS = 30;

interface ThinkingTimerProps {
  onDone: () => void;
}

export function ThinkingTimer({ onDone }: ThinkingTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(THINKING_SECONDS);
  const { t } = useLanguage();

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDone();
      return;
    }
    const id = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [secondsLeft, onDone]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.thinkingTimer.prompt}</p>
      <div className="text-6xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
        {secondsLeft}
      </div>
      <Button variant="secondary" onClick={onDone}>
        {t.thinkingTimer.skip}
      </Button>
    </div>
  );
}
