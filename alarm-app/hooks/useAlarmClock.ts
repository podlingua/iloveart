"use client";

import { useEffect, useRef, useState } from "react";
import { Alarm } from "@/lib/db/alarms";
import { playAlarmSound, stopAlarmSound } from "@/lib/alarm/sound";

const SNOOZE_MINUTES = 9;

interface SnoozeEntry {
  alarm: Alarm;
  ringAt: number;
}

function todayString() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

function requestNotification(alarm: Alarm) {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission === "granted") {
    new Notification(alarm.label || "Alarm", { body: "Time to wake up!" });
  }
}

export function useAlarmClock(
  alarms: Alarm[],
  onFire: (id: string, patch: { last_fired_on: string; enabled: boolean }) => void
) {
  const [ringingAlarm, setRingingAlarm] = useState<Alarm | null>(null);
  const snoozed = useRef<Map<string, SnoozeEntry>>(new Map());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const today = todayString();

      // Snoozed alarms take priority once their timer elapses.
      for (const [id, entry] of snoozed.current) {
        if (now.getTime() >= entry.ringAt) {
          snoozed.current.delete(id);
          setRingingAlarm((current) => current ?? entry.alarm);
          return;
        }
      }

      if (ringingAlarm) return;

      const match = alarms.find((alarm) => {
        if (!alarm.enabled) return false;
        if (alarm.hour !== now.getHours() || alarm.minute !== now.getMinutes()) return false;
        if (alarm.last_fired_on === today) return false;
        if (alarm.repeat_days.length > 0 && !alarm.repeat_days.includes(now.getDay())) return false;
        return true;
      });

      if (match) {
        setRingingAlarm(match);
        onFire(match.id, { last_fired_on: today, enabled: match.repeat_days.length > 0 });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [alarms, ringingAlarm, onFire]);

  useEffect(() => {
    if (ringingAlarm) {
      playAlarmSound();
      requestNotification(ringingAlarm);
    } else {
      stopAlarmSound();
    }
  }, [ringingAlarm]);

  const dismiss = () => setRingingAlarm(null);

  const snooze = () => {
    if (!ringingAlarm) return;
    snoozed.current.set(ringingAlarm.id, {
      alarm: ringingAlarm,
      ringAt: Date.now() + SNOOZE_MINUTES * 60 * 1000,
    });
    setRingingAlarm(null);
  };

  return { ringingAlarm, dismiss, snooze };
}
