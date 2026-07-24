"use client";

import { useCallback, useEffect, useState } from "react";
import { Alarm, loadAlarms, saveAlarms } from "@/lib/alarms";

export function useAlarms() {
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.resolve().then(() => {
      setAlarms(loadAlarms());
      setReady(true);
    });
  }, []);

  const persist = useCallback((next: Alarm[]) => {
    setAlarms(next);
    saveAlarms(next);
  }, []);

  const add = useCallback(
    (alarm: Alarm) => {
      persist([...loadAlarms(), alarm].sort(byTime));
    },
    [persist]
  );

  const update = useCallback(
    (id: string, patch: Partial<Alarm>) => {
      persist(loadAlarms().map((a) => (a.id === id ? { ...a, ...patch } : a)).sort(byTime));
    },
    [persist]
  );

  const remove = useCallback(
    (id: string) => {
      persist(loadAlarms().filter((a) => a.id !== id));
    },
    [persist]
  );

  const toggle = useCallback(
    (id: string, enabled: boolean) => update(id, { enabled }),
    [update]
  );

  return { alarms, ready, add, update, remove, toggle };
}

function byTime(a: Alarm, b: Alarm) {
  return a.hour - b.hour || a.minute - b.minute;
}
