"use client";

import { useCallback } from "react";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { useAlarms } from "@/hooks/useAlarms";
import { useAlarmClock } from "@/hooks/useAlarmClock";
import { AlarmForm } from "@/components/alarms/AlarmForm";
import { AlarmListItem } from "@/components/alarms/AlarmListItem";
import { RingingOverlay } from "@/components/alarms/RingingOverlay";
import { Card } from "@/components/ui/Card";

export default function Dashboard() {
  const { loading: authLoading } = useAuth();
  const { alarms, loading, add, update, toggle, remove } = useAlarms();

  const handleFire = useCallback(
    (id: string, patch: { last_fired_on: string; enabled: boolean }) => {
      update(id, patch);
    },
    [update]
  );

  const { ringingAlarm, dismiss, snooze } = useAlarmClock(alarms, handleFire);

  if (!isSupabaseConfigured) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Supabase is not configured
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then run
          the migration in supabase/migrations/0001_init.sql.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-12">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Alarms</h1>

      <AlarmForm onCreate={add} />

      <Card>
        {authLoading || loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : alarms.length === 0 ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            No alarms yet. Add one above.
          </p>
        ) : (
          alarms.map((alarm) => (
            <AlarmListItem
              key={alarm.id}
              alarm={alarm}
              onToggle={(enabled) => toggle(alarm.id, enabled)}
              onDelete={() => remove(alarm.id)}
            />
          ))
        )}
      </Card>

      {ringingAlarm && (
        <RingingOverlay alarm={ringingAlarm} onDismiss={dismiss} onSnooze={snooze} />
      )}
    </div>
  );
}
