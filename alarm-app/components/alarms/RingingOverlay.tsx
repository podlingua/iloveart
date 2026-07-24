"use client";

import { Alarm } from "@/lib/db/alarms";
import { Button } from "@/components/ui/Button";
import { formatTime } from "@/lib/alarm/days";

export function RingingOverlay({
  alarm,
  onDismiss,
  onSnooze,
}: {
  alarm: Alarm;
  onDismiss: () => void;
  onSnooze: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-zinc-950/95 px-6 text-center backdrop-blur">
      <div className="animate-pulse text-7xl font-semibold text-white">
        {formatTime(alarm.hour, alarm.minute)}
      </div>
      {alarm.label && <div className="text-xl text-zinc-300">{alarm.label}</div>}

      <div className="flex gap-4">
        <Button variant="secondary" onClick={onSnooze} className="px-8 py-4 text-base">
          Snooze 9 min
        </Button>
        <Button variant="danger" onClick={onDismiss} className="px-8 py-4 text-base">
          Dismiss
        </Button>
      </div>
    </div>
  );
}
