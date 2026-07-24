"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAlarms } from "@/hooks/useAlarms";
import { AlarmForm } from "@/components/AlarmForm";

export default function EditAlarmPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { alarms, ready, update, remove } = useAlarms();
  const alarm = alarms.find((a) => a.id === params.id);

  useEffect(() => {
    if (ready && !alarm) router.replace("/");
  }, [ready, alarm, router]);

  if (!alarm) return null;

  return (
    <AlarmForm
      isNew={false}
      initial={alarm}
      onSave={(updated) => {
        update(updated.id, updated);
        router.push("/");
      }}
      onDelete={() => {
        remove(alarm.id);
        router.push("/");
      }}
    />
  );
}
