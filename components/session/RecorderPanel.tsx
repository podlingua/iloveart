"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { useRecorder } from "@/hooks/useRecorder";

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface RecorderPanelProps {
  onRecorded: (blob: Blob, url: string, durationSeconds: number) => void;
}

export function RecorderPanel({ onRecorded }: RecorderPanelProps) {
  const { status, elapsedSeconds, audioBlob, audioUrl, error, start, stop, maxSeconds } =
    useRecorder();
  const reportedRef = useRef(false);

  useEffect(() => {
    if (status === "stopped" && audioBlob && audioUrl && !reportedRef.current) {
      reportedRef.current = true;
      onRecorded(audioBlob, audioUrl, elapsedSeconds);
    }
    if (status !== "stopped") {
      reportedRef.current = false;
    }
  }, [status, audioBlob, audioUrl, elapsedSeconds, onRecorded]);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {status === "idle" && (
        <>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            You&apos;ll have up to {formatTime(maxSeconds)} to respond.
          </p>
          <Button onClick={start}>Start recording</Button>
        </>
      )}

      {status === "requesting-permission" && (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Requesting microphone access&hellip;
        </p>
      )}

      {(status === "recording" || status === "stopped") && (
        <div className="flex items-center gap-3">
          {status === "recording" && (
            <span className="h-3 w-3 animate-pulse rounded-full bg-red-500" />
          )}
          <span className="text-4xl font-semibold tabular-nums text-zinc-900 dark:text-zinc-100">
            {formatTime(elapsedSeconds)}
          </span>
          <span className="text-sm text-zinc-400">/ {formatTime(maxSeconds)}</span>
        </div>
      )}

      {status === "recording" && (
        <Button variant="secondary" onClick={stop}>
          Stop recording
        </Button>
      )}

      {status === "error" && error && (
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <Button variant="secondary" onClick={start}>
            Try again
          </Button>
        </div>
      )}
    </div>
  );
}
