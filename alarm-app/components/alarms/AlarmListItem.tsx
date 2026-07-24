"use client";

import { Alarm } from "@/lib/db/alarms";
import { formatRepeat, formatTime } from "@/lib/alarm/days";

export function AlarmListItem({
  alarm,
  onToggle,
  onDelete,
}: {
  alarm: Alarm;
  onToggle: (enabled: boolean) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-between border-b border-zinc-100 py-4 last:border-0 dark:border-zinc-800">
      <div className={alarm.enabled ? "" : "opacity-40"}>
        <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          {formatTime(alarm.hour, alarm.minute)}
        </div>
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          {alarm.label ? `${alarm.label} · ` : ""}
          {formatRepeat(alarm.repeat_days)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => onToggle(!alarm.enabled)}
          aria-pressed={alarm.enabled}
          aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
          className={`relative h-7 w-12 rounded-full transition-colors ${
            alarm.enabled ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700"
          }`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-transform dark:bg-zinc-900 ${
              alarm.enabled ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>

        <button
          type="button"
          onClick={onDelete}
          aria-label="Delete alarm"
          className="text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
