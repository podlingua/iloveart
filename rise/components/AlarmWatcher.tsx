"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAlarms } from "@/hooks/useAlarms";
import { resolveWakeParams, wakeUrl } from "@/lib/trigger";
import { clearSnooze, getDueSnooze } from "@/lib/snooze";

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

/**
 * Mounted once, app-wide: this is the closest thing this prototype has to the
 * real Alarm Engine's scheduler. It ticks every second and, on a match,
 * navigates straight into the Wake Sequence — the same way the production
 * app's alarm fires over whatever screen happens to be showing.
 */
export function AlarmWatcher() {
  const { alarms, update } = useAlarms();
  const router = useRouter();
  const pathname = usePathname();
  const alarmsRef = useRef(alarms);
  const pathRef = useRef(pathname);

  useEffect(() => {
    alarmsRef.current = alarms;
    pathRef.current = pathname;
  }, [alarms, pathname]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (pathRef.current.startsWith("/wake")) return;

      const dueSnooze = getDueSnooze();
      if (dueSnooze) {
        clearSnooze();
        const params = new URLSearchParams({ scene: dueSnooze.scene, test: "0" });
        router.push(`/wake/${dueSnooze.alarmId}?${params.toString()}`);
        return;
      }

      const now = new Date();
      const today = todayString();

      const match = alarmsRef.current.find((alarm) => {
        if (!alarm.enabled) return false;
        if (alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) return false;
        if (alarm.lastFiredOn === today) return false;
        if (alarm.repeatDays.length > 0 && !alarm.repeatDays.includes(now.getDay())) return false;
        return true;
      });

      if (match) {
        update(match.id, {
          lastFiredOn: today,
          enabled: match.repeatDays.length > 0,
        });
        const params = resolveWakeParams(match, false);
        router.push(wakeUrl(params));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [router, update]);

  return null;
}
