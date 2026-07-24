import { SceneId } from "@/lib/scenes";

export type ContentType = "scene" | "surprise";

export interface Alarm {
  id: string;
  label: string;
  hour: number;
  minute: number;
  repeatDays: number[]; // 0=Sun..6=Sat, [] = one-time
  enabled: boolean;
  contentType: ContentType;
  sceneId: SceneId; // used directly, or as the last-resolved scene when contentType is "surprise"
  volumeStart: number; // 0-100
  volumeEnd: number; // 0-100
  fadeInSeconds: number;
  brightnessFade: boolean;
  lastFiredOn: string | null; // ISO date, same-day de-dupe guard
}

const STORAGE_KEY = "rise.alarms.v1";

export function newAlarm(): Alarm {
  return {
    id: crypto.randomUUID(),
    label: "",
    hour: 7,
    minute: 0,
    repeatDays: [1, 2, 3, 4, 5],
    enabled: true,
    contentType: "surprise",
    sceneId: "sunrise",
    volumeStart: 10,
    volumeEnd: 75,
    fadeInSeconds: 45,
    brightnessFade: true,
    lastFiredOn: null,
  };
}

export function loadAlarms(): Alarm[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Alarm[];
  } catch {
    return [];
  }
}

export function saveAlarms(alarms: Alarm[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(alarms));
}

export function formatTime(hour: number, minute: number): string {
  const period = hour < 12 ? "AM" : "PM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`;
}

const DAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function formatRepeat(repeatDays: number[]): string {
  if (repeatDays.length === 0) return "Once";
  if (repeatDays.length === 7) return "Every day";
  const weekdays = [1, 2, 3, 4, 5];
  const weekend = [0, 6];
  const sorted = [...repeatDays].sort();
  if (sorted.length === 5 && sorted.every((d) => weekdays.includes(d))) return "Weekdays";
  if (sorted.length === 2 && sorted.every((d) => weekend.includes(d))) return "Weekends";
  return sorted.map((d) => DAY_LABELS[d]).join(" ");
}

export function nextFireLabel(alarm: Alarm): string {
  const now = new Date();
  const candidate = new Date();
  candidate.setSeconds(0, 0);
  candidate.setHours(alarm.hour, alarm.minute);

  if (alarm.repeatDays.length === 0) {
    if (candidate <= now) candidate.setDate(candidate.getDate() + 1);
    return candidate.toDateString() === now.toDateString()
      ? `Today, ${formatTime(alarm.hour, alarm.minute)}`
      : `Tomorrow, ${formatTime(alarm.hour, alarm.minute)}`;
  }

  for (let i = 0; i < 8; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    d.setHours(alarm.hour, alarm.minute, 0, 0);
    if (d <= now) continue;
    if (alarm.repeatDays.includes(d.getDay())) {
      if (i === 0) return `Today, ${formatTime(alarm.hour, alarm.minute)}`;
      if (i === 1) return `Tomorrow, ${formatTime(alarm.hour, alarm.minute)}`;
      return `${d.toLocaleDateString(undefined, { weekday: "long" })}, ${formatTime(alarm.hour, alarm.minute)}`;
    }
  }
  return formatTime(alarm.hour, alarm.minute);
}
