"use client";

import { useRouter } from "next/navigation";
import { useAlarms } from "@/hooks/useAlarms";
import { newAlarm } from "@/lib/alarms";
import { AlarmForm } from "@/components/AlarmForm";

export default function CreateAlarmPage() {
  const router = useRouter();
  const { add } = useAlarms();

  return (
    <AlarmForm
      isNew
      initial={newAlarm()}
      onSave={(alarm) => {
        add(alarm);
        router.push("/");
      }}
    />
  );
}
