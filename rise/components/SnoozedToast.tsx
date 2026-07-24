"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function SnoozedToast() {
  const search = useSearchParams();
  const router = useRouter();
  const snoozedSeconds = search.get("snoozed");
  const [visible, setVisible] = useState(Boolean(snoozedSeconds));

  useEffect(() => {
    if (!snoozedSeconds) return;
    const t = setTimeout(() => {
      setVisible(false);
      router.replace("/");
    }, 4000);
    return () => clearTimeout(t);
  }, [snoozedSeconds, router]);

  if (!snoozedSeconds || !visible) return null;

  return (
    <div className="fixed left-1/2 top-8 z-10 -translate-x-1/2 rounded-full bg-white/10 px-6 py-3 text-sm text-white/80 backdrop-blur">
      Snoozed — back in {snoozedSeconds}s
    </div>
  );
}
