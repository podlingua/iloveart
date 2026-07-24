import { Alarm } from "@/lib/alarms";
import { SceneId } from "@/lib/scenes";
import { pickSurprise } from "@/lib/surprise";

export interface WakeParams {
  alarmId: string;
  scene: SceneId;
  test: boolean;
}

/** Resolves what a firing alarm should actually show — the one place Surprise Mode gets decided. */
export function resolveWakeParams(alarm: Alarm, test: boolean): WakeParams {
  const scene = alarm.contentType === "surprise" ? pickSurprise() : alarm.sceneId;
  return { alarmId: alarm.id, scene, test };
}

export function wakeUrl(params: WakeParams): string {
  const q = new URLSearchParams({
    scene: params.scene,
    test: params.test ? "1" : "0",
  });
  return `/wake/${params.alarmId}?${q.toString()}`;
}
