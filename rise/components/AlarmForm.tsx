"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSpatialNav } from "@/hooks/useSpatialNav";
import { Alarm, formatTime } from "@/lib/alarms";
import { SCENE_LIST } from "@/lib/scenes";
import { resolveWakeParams, wakeUrl } from "@/lib/trigger";
import { FocusCard } from "@/components/ui/FocusCard";
import { TvButton } from "@/components/ui/TvButton";
import { Stepper } from "@/components/ui/Stepper";
import { RemoteHintBar } from "@/components/ui/RemoteHintBar";

const DAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

export function AlarmForm({
  initial,
  onSave,
  onDelete,
  isNew,
}: {
  initial: Alarm;
  onSave: (alarm: Alarm) => void;
  onDelete?: () => void;
  isNew: boolean;
}) {
  useSpatialNav();
  const router = useRouter();
  const [alarm, setAlarm] = useState(initial);
  const [testCountdown, setTestCountdown] = useState<number | null>(null);

  const patch = (p: Partial<Alarm>) => setAlarm((a) => ({ ...a, ...p }));

  useEffect(() => {
    if (testCountdown === null) return;
    if (testCountdown === 0) {
      router.push(wakeUrl(resolveWakeParams(alarm, true)));
      return;
    }
    const t = setTimeout(() => setTestCountdown((c) => (c ?? 1) - 1), 1000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [testCountdown]);

  const toggleDay = (d: number) => {
    patch({
      repeatDays: alarm.repeatDays.includes(d)
        ? alarm.repeatDays.filter((x) => x !== d)
        : [...alarm.repeatDays, d],
    });
  };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(ellipse_at_top,_#141428,_#030308_65%)] px-[5%] py-16 pb-32">
      <header className="mb-10">
        <p className="text-sm uppercase tracking-[0.2em] text-white/40">
          {isNew ? "New alarm" : "Edit alarm"}
        </p>
        <h1 className="text-5xl font-semibold tabular-nums">{formatTime(alarm.hour, alarm.minute)}</h1>
      </header>

      <div className="grid max-w-5xl grid-cols-1 gap-10 md:grid-cols-2">
        <section className="flex flex-col gap-8">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Time</p>
            <div className="flex gap-8">
              <Stepper
                label="Hour"
                value={String(alarm.hour).padStart(2, "0")}
                onDecrease={() => patch({ hour: (alarm.hour + 23) % 24 })}
                onIncrease={() => patch({ hour: (alarm.hour + 1) % 24 })}
              />
              <Stepper
                label="Minute"
                value={String(alarm.minute).padStart(2, "0")}
                onDecrease={() => patch({ minute: (alarm.minute + 55) % 60 })}
                onIncrease={() => patch({ minute: (alarm.minute + 5) % 60 })}
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Label</p>
            <input
              data-tv-focusable
              value={alarm.label}
              onChange={(e) => patch({ label: e.target.value })}
              placeholder="Alarm"
              className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-lg text-white outline-none focus:border-white/60"
            />
          </div>

          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Repeat</p>
            <div className="flex gap-2">
              {DAYS.map((d) => (
                <button
                  key={d.value}
                  data-tv-focusable
                  onClick={() => toggleDay(d.value)}
                  onKeyDown={(e) => e.key === "Enter" && toggleDay(d.value)}
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-sm font-medium outline-none transition-all focus:scale-110 focus:ring-2 focus:ring-white ${
                    alarm.repeatDays.includes(d.value)
                      ? "bg-white text-black"
                      : "bg-white/10 text-white/50"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <p className="text-xs uppercase tracking-wide text-white/40">Fade-in</p>
            <div className="flex flex-wrap gap-8">
              <Stepper
                label="Start volume"
                value={`${alarm.volumeStart}%`}
                onDecrease={() => patch({ volumeStart: Math.max(0, alarm.volumeStart - 5) })}
                onIncrease={() =>
                  patch({ volumeStart: Math.min(alarm.volumeEnd, alarm.volumeStart + 5) })
                }
              />
              <Stepper
                label="Peak volume"
                value={`${alarm.volumeEnd}%`}
                onDecrease={() =>
                  patch({ volumeEnd: Math.max(alarm.volumeStart, alarm.volumeEnd - 5) })
                }
                onIncrease={() => patch({ volumeEnd: Math.min(100, alarm.volumeEnd + 5) })}
              />
              <Stepper
                label="Duration"
                value={`${alarm.fadeInSeconds}s`}
                onDecrease={() => patch({ fadeInSeconds: Math.max(15, alarm.fadeInSeconds - 15) })}
                onIncrease={() => patch({ fadeInSeconds: Math.min(300, alarm.fadeInSeconds + 15) })}
              />
            </div>
            <button
              data-tv-focusable
              onClick={() => patch({ brightnessFade: !alarm.brightnessFade })}
              onKeyDown={(e) => e.key === "Enter" && patch({ brightnessFade: !alarm.brightnessFade })}
              className="flex w-fit items-center gap-3 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm outline-none focus:border-white/60"
            >
              <span
                className={`h-5 w-9 rounded-full transition-colors ${
                  alarm.brightnessFade ? "bg-white" : "bg-white/20"
                }`}
              >
                <span
                  className={`block h-4 w-4 translate-y-0.5 rounded-full bg-black transition-transform ${
                    alarm.brightnessFade ? "translate-x-4" : "translate-x-0.5"
                  }`}
                />
              </span>
              Fade screen brightness too
            </button>
          </div>

          <p className="text-xs text-white/30">
            Backup sound: built-in tone, always available — no internet or content required.
          </p>
        </section>

        <section>
          <p className="mb-3 text-xs uppercase tracking-wide text-white/40">Wake content</p>
          <div className="grid grid-cols-2 gap-3">
            <FocusCard
              accent="#ffffff"
              onClick={() => patch({ contentType: "surprise" })}
              onKeyDown={(e) => e.key === "Enter" && patch({ contentType: "surprise" })}
              className={`col-span-2 flex items-center justify-between p-5 ${
                alarm.contentType === "surprise" ? "border-white/60 bg-white/10" : ""
              }`}
            >
              <div>
                <div className="text-lg font-semibold">Surprise Mode</div>
                <div className="text-sm text-white/50">A different scene every morning</div>
              </div>
              {alarm.contentType === "surprise" && <span className="text-2xl">✓</span>}
            </FocusCard>

            {SCENE_LIST.map((scene) => (
              <SceneTile
                key={scene.id}
                label={scene.label}
                accent={scene.accent}
                selected={alarm.contentType === "scene" && alarm.sceneId === scene.id}
                onSelect={() => patch({ contentType: "scene", sceneId: scene.id })}
              />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-4">
        <TvButton onClick={() => onSave(alarm)}>Save</TvButton>
        <TvButton
          variant="secondary"
          disabled={testCountdown !== null}
          onClick={() => setTestCountdown(3)}
        >
          {testCountdown !== null ? `Testing in ${testCountdown}…` : "Test alarm"}
        </TvButton>
        {onDelete && (
          <TvButton variant="ghost" onClick={onDelete}>
            Delete
          </TvButton>
        )}
        <TvButton variant="ghost" onClick={() => router.push("/")}>
          Cancel
        </TvButton>
      </div>

      <RemoteHintBar hints={["↑↓←→ Navigate", "OK Select", "Test alarm runs the real wake sequence"]} />
    </div>
  );
}

function SceneTile({
  label,
  accent,
  selected,
  onSelect,
}: {
  label: string;
  accent: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <FocusCard
      accent={accent}
      onClick={onSelect}
      onKeyDown={(e) => e.key === "Enter" && onSelect()}
      className={`flex h-24 items-center justify-between overflow-hidden p-5 ${
        selected ? "bg-white/10" : ""
      }`}
      style={{ borderColor: selected ? accent : undefined }}
    >
      <span className="font-medium">{label}</span>
      {selected && <span className="text-xl" style={{ color: accent }}>✓</span>}
    </FocusCard>
  );
}
