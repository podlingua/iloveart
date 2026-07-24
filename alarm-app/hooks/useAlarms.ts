"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { useAuth } from "@/lib/supabase/AuthProvider";
import {
  Alarm,
  NewAlarm,
  createAlarm,
  deleteAlarm,
  listAlarms,
  updateAlarm,
} from "@/lib/db/alarms";

export function useAlarms() {
  const { user, loading: authLoading } = useAuth();
  const [alarms, setAlarms] = useState<Alarm[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured || !user) {
      setAlarms([]);
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const data = await listAlarms(supabase);
    setAlarms(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    let ignore = false;
    const load = async () => {
      if (!isSupabaseConfigured || !user) return [];
      const supabase = createClient();
      return listAlarms(supabase);
    };

    load().then((data) => {
      if (ignore) return;
      setAlarms(data);
      setLoading(false);
    });

    return () => {
      ignore = true;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (!isSupabaseConfigured || !user) return;

    const supabase = createClient();
    const channel = supabase
      .channel(`alarms-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "alarms", filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refresh]);

  const add = useCallback(
    async (alarm: NewAlarm) => {
      if (!user) return;
      const supabase = createClient();
      const created = await createAlarm(supabase, user.id, alarm);
      setAlarms((prev) => [...prev, created].sort(sortAlarms));
    },
    [user]
  );

  const update = useCallback(
    async (id: string, patch: Parameters<typeof updateAlarm>[2]) => {
      const supabase = createClient();
      const updated = await updateAlarm(supabase, id, patch);
      setAlarms((prev) => prev.map((a) => (a.id === id ? updated : a)).sort(sortAlarms));
    },
    []
  );

  const remove = useCallback(async (id: string) => {
    const supabase = createClient();
    await deleteAlarm(supabase, id);
    setAlarms((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const toggle = useCallback(
    async (id: string, enabled: boolean) => {
      await update(id, { enabled });
    },
    [update]
  );

  return { alarms, loading: authLoading || loading, add, update, remove, toggle };
}

function sortAlarms(a: Alarm, b: Alarm) {
  return a.hour - b.hour || a.minute - b.minute;
}
