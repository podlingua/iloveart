import type { SupabaseClient } from "@supabase/supabase-js";

export interface Alarm {
  id: string;
  user_id: string;
  label: string;
  hour: number;
  minute: number;
  repeat_days: number[];
  enabled: boolean;
  last_fired_on: string | null;
  created_at: string;
}

export type NewAlarm = Pick<Alarm, "label" | "hour" | "minute" | "repeat_days">;

export async function listAlarms(supabase: SupabaseClient): Promise<Alarm[]> {
  const { data, error } = await supabase
    .from("alarms")
    .select("*")
    .order("hour", { ascending: true })
    .order("minute", { ascending: true });

  if (error) throw error;
  return data ?? [];
}

export async function createAlarm(
  supabase: SupabaseClient,
  userId: string,
  alarm: NewAlarm
): Promise<Alarm> {
  const { data, error } = await supabase
    .from("alarms")
    .insert({ ...alarm, user_id: userId })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function updateAlarm(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<Pick<Alarm, "label" | "hour" | "minute" | "repeat_days" | "enabled" | "last_fired_on">>
): Promise<Alarm> {
  const { data, error } = await supabase
    .from("alarms")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

export async function deleteAlarm(supabase: SupabaseClient, id: string): Promise<void> {
  const { error } = await supabase.from("alarms").delete().eq("id", id);
  if (error) throw error;
}
