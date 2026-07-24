"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useSpatialNav } from "@/hooks/useSpatialNav";
import { loadAlarms, formatTime } from "@/lib/alarms";
import { SCENES, SceneId } from "@/lib/scenes";
import { setSnooze } from "@/lib/snooze";
import { startAmbient, stopAmbient } from "@/lib/sound";
import { Scene } from "@/components/scenes/Scene";
import { TvButton } from "@/components/ui/TvButton";

const SNOOZE_DEMO_SECONDS = 15; // compressed from the real product's 9 minutes, for a live demo

export default function WakeSequencePage() {
  useSpatialNav();
  const params = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();

  const sceneId = (search.get("scene") as SceneId) || "sunrise";
  const isTest = search.get("test") === "1";
  const scene = SCENES[sceneId] ?? SCENES.sunrise;

  const alarm = useMemo(() => loadAlarms().find((a) => a.id === params.id), [params.id]);

  const [brightness, setBrightness] = useState(alarm?.brightnessFade === false ? 1 : 0);
  const [showTime, setShowTime] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    startAmbient(
      scene,
      alarm?.volumeStart ?? 10,
      alarm?.volumeEnd ?? 75,
      alarm?.fadeInSeconds ?? 45
    );
    return () => stopAmbient();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sceneId]);

  useEffect(() => {
    if (alarm?.brightnessFade === false) return;
    const start = performance.now();
    const durationMs = 20_000;
    let raf = 0;
    const tick = (t: number) => {
      const progress = Math.min(1, (t - start) / durationMs);
      setBrightness(progress);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [alarm?.brightnessFade]);

  useEffect(() => {
    const t = setTimeout(() => setShowTime(true), 2000);
    const clock = setInterval(() => setNow(new Date()), 1000);
    return () => {
      clearTimeout(t);
      clearInterval(clock);
    };
  }, []);

  const dismiss = () => {
    stopAmbient();
    router.push("/");
  };

  const snooze = () => {
    stopAmbient();
    setSnooze(params.id, sceneId, Date.now() + SNOOZE_DEMO_SECONDS * 1000);
    router.push(`/?snoozed=${SNOOZE_DEMO_SECONDS}`);
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden">
      <Scene scene={scene} brightness={brightness} className="absolute inset-0" />

      <div
        className={`absolute left-[5%] top-[5%] font-mono text-2xl tabular-nums text-white/80 transition-opacity duration-1000 ${
          showTime ? "opacity-60" : "opacity-0"
        }`}
      >
        {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
      </div>

      {isTest && (
        <div className="absolute right-[5%] top-[5%] rounded-full bg-white/10 px-4 py-1.5 text-xs uppercase tracking-wide text-white/60">
          Test alarm
        </div>
      )}

      <div className="absolute inset-x-0 bottom-[8%] flex flex-col items-center gap-6 text-center">
        <div>
          <div className="text-8xl font-semibold tabular-nums drop-shadow-[0_2px_20px_rgba(0,0,0,0.6)]">
            {formatTime(alarm?.hour ?? now.getHours(), alarm?.minute ?? now.getMinutes())}
          </div>
          {alarm?.label && <div className="mt-2 text-xl text-white/70">{alarm.label}</div>}
        </div>

        <div className="flex gap-4">
          <TvButton variant="secondary" onClick={snooze} autoFocus>
            Snooze
          </TvButton>
          <TvButton onClick={dismiss}>Dismiss</TvButton>
        </div>
      </div>
    </div>
  );
}
