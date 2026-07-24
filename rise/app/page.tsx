"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAlarms } from "@/hooks/useAlarms";
import { useSpatialNav } from "@/hooks/useSpatialNav";
import { Alarm, formatRepeat, formatTime, nextFireLabel } from "@/lib/alarms";
import { SCENES } from "@/lib/scenes";
import { FocusCard } from "@/components/ui/FocusCard";
import { RemoteHintBar } from "@/components/ui/RemoteHintBar";
import { SnoozedToast } from "@/components/SnoozedToast";

export default function Home() {
  useSpatialNav();
  const router = useRouter();
  const { alarms, ready, toggle } = useAlarms();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const nextAlarm = alarms.filter((a) => a.enabled)[0] ?? null;

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_#141428,_#030308_65%)] px-[5%] py-16">
      <Suspense fallback={null}>
        <SnoozedToast />
      </Suspense>
      <header className="mb-12 flex items-baseline justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/40">Rise</p>
          <h1 className="text-4xl font-semibold">Good {partOfDay(now)}.</h1>
        </div>
        <span className="font-mono text-2xl tabular-nums text-white/50">
          {now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
        </span>
      </header>

      {ready && nextAlarm && (
        <section className="mb-14">
          <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">Next alarm</p>
          <FocusCard
            accent={SCENES[nextAlarm.sceneId].accent}
            onClick={() => router.push(`/edit/${nextAlarm.id}`)}
            onKeyDown={(e) => e.key === "Enter" && router.push(`/edit/${nextAlarm.id}`)}
            className="flex items-center justify-between overflow-hidden p-10"
            style={{
              background: `linear-gradient(120deg, ${SCENES[nextAlarm.sceneId].accent}22, transparent 60%)`,
            }}
          >
            <div>
              <div className="text-7xl font-semibold tabular-nums">
                {formatTime(nextAlarm.hour, nextAlarm.minute)}
              </div>
              <div className="mt-2 text-xl text-white/60">
                {nextAlarm.label || "Alarm"} · {nextFireLabel(nextAlarm)}
              </div>
            </div>
            <div className="text-right text-white/50">
              <div className="text-sm uppercase tracking-wide">
                {nextAlarm.contentType === "surprise" ? "Surprise" : SCENES[nextAlarm.sceneId].label}
              </div>
              <div className="text-sm">{formatRepeat(nextAlarm.repeatDays)}</div>
            </div>
          </FocusCard>
        </section>
      )}

      <section>
        <p className="mb-4 text-sm uppercase tracking-[0.2em] text-white/40">All alarms</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {alarms.map((alarm) => (
            <AlarmCard
              key={alarm.id}
              alarm={alarm}
              onOpen={() => router.push(`/edit/${alarm.id}`)}
              onToggle={(enabled) => toggle(alarm.id, enabled)}
            />
          ))}

          <FocusCard
            onClick={() => router.push("/create")}
            onKeyDown={(e) => e.key === "Enter" && router.push("/create")}
            className="flex min-h-[140px] items-center justify-center text-4xl text-white/30 focus:text-white"
          >
            +
          </FocusCard>
        </div>

        {ready && alarms.length === 0 && (
          <p className="mt-6 text-white/40">No alarms yet. Select + to create your first one.</p>
        )}
      </section>

      <RemoteHintBar hints={["↑↓←→ Navigate", "OK Select"]} />
    </div>
  );
}

function AlarmCard({
  alarm,
  onOpen,
  onToggle,
}: {
  alarm: Alarm;
  onOpen: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const scene = SCENES[alarm.sceneId];
  return (
    <FocusCard
      accent={scene.accent}
      className={`flex min-h-[140px] flex-col justify-between p-6 ${alarm.enabled ? "" : "opacity-40"}`}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter") onOpen();
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-3xl font-semibold tabular-nums">
            {formatTime(alarm.hour, alarm.minute)}
          </div>
          <div className="mt-1 text-sm text-white/50">{alarm.label || "Alarm"}</div>
        </div>
        <button
          data-tv-focusable
          onClick={(e) => {
            e.stopPropagation();
            onToggle(!alarm.enabled);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onToggle(!alarm.enabled);
            }
          }}
          aria-label={alarm.enabled ? "Disable alarm" : "Enable alarm"}
          className={`relative h-6 w-11 shrink-0 rounded-full outline-none transition-colors focus:ring-2 focus:ring-white ${
            alarm.enabled ? "bg-white" : "bg-white/15"
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-black transition-transform ${
              alarm.enabled ? "translate-x-5 bg-black" : "translate-x-0.5 bg-white/60"
            }`}
          />
        </button>
      </div>
      <div className="text-sm text-white/40">
        {formatRepeat(alarm.repeatDays)} ·{" "}
        {alarm.contentType === "surprise" ? "Surprise" : scene.label}
      </div>
    </FocusCard>
  );
}

function partOfDay(now: Date): string {
  const h = now.getHours();
  if (h < 12) return "morning";
  if (h < 18) return "afternoon";
  return "evening";
}
