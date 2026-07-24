"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { WEEKDAY_LABELS } from "@/lib/alarm/days";
import { NewAlarm } from "@/lib/db/alarms";

export function AlarmForm({ onCreate }: { onCreate: (alarm: NewAlarm) => Promise<void> }) {
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [repeatDays, setRepeatDays] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const toggleDay = (day: number) => {
    setRepeatDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const [hourStr, minuteStr] = time.split(":");
    setSubmitting(true);
    try {
      await onCreate({
        label,
        hour: Number(hourStr),
        minute: Number(minuteStr),
        repeat_days: repeatDays,
      });
      setLabel("");
      setRepeatDays([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="rounded-lg border border-zinc-300 bg-white px-4 py-3 text-lg text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
          />
        </div>

        <div className="flex items-center gap-2">
          {WEEKDAY_LABELS.map((label, day) => (
            <button
              key={day}
              type="button"
              onClick={() => toggleDay(day)}
              aria-pressed={repeatDays.includes(day)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                repeatDays.includes(day)
                  ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding…" : "Add alarm"}
        </Button>
      </form>
    </Card>
  );
}
