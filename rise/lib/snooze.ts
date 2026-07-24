import { SceneId } from "@/lib/scenes";

const KEY = "rise.snooze.v1";

interface Snooze {
  alarmId: string;
  scene: SceneId;
  resumeAt: number;
}

export function setSnooze(alarmId: string, scene: SceneId, resumeAt: number) {
  window.localStorage.setItem(KEY, JSON.stringify({ alarmId, scene, resumeAt } satisfies Snooze));
}

export function clearSnooze() {
  window.localStorage.removeItem(KEY);
}

export function getDueSnooze(): Snooze | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const snooze = JSON.parse(raw) as Snooze;
    return Date.now() >= snooze.resumeAt ? snooze : null;
  } catch {
    return null;
  }
}
