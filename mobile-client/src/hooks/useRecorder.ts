
import { useCallback, useEffect, useRef, useState } from "react";

export const MAX_RECORDING_SECONDS = 120;

export type RecorderStatus =
  | "idle"
  | "requesting-permission"
  | "recording"
  | "stopped"
  | "error";

function pickSupportedMimeType(): string | undefined {
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const type of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return undefined;
}

export function useRecorder() {
  const [status, setStatus] = useState<RecorderStatus>("idle");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const start = useCallback(async () => {
    setError(null);
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsedSeconds(0);
    chunksRef.current = [];
    setStatus("requesting-permission");

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = pickSupportedMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        console.log("[useRecorder] onstop fired", {
          chunkCount: chunksRef.current.length,
          recorderMimeType: recorder.mimeType,
        });
        clearTimer();
        try {
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || "audio/webm",
          });
          console.log("[useRecorder] blob created", { type: blob.type, size: blob.size });

          if (blob.size === 0) {
            throw new Error(
              "Recorded Blob has zero bytes - no audio data was captured before stop() was called."
            );
          }
          if (!blob.type) {
            console.warn("[useRecorder] Blob has no MIME type set.");
          }

          const url = URL.createObjectURL(blob);
          console.log("[useRecorder] object URL created", url);

          setAudioBlob(blob);
          setAudioUrl(url);
          setStatus("stopped");
        } catch (err) {
          const e = err as Error;
          console.error("[useRecorder] onstop failed", {
            name: e?.name,
            message: e?.message,
            stack: e?.stack,
          });
          setStatus("error");
          setError(e?.message || "Recording failed to finalize.");
        } finally {
          streamRef.current?.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      };

      recorder.start();
      startTimeRef.current = Date.now();
      setStatus("recording");

      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsedSeconds(seconds);
        if (seconds >= MAX_RECORDING_SECONDS) {
          stop();
        }
      }, 250);
    } catch {
      setStatus("error");
      setError(
        "Microphone access was denied or is unavailable. Please allow microphone access and try again."
      );
    }
  }, [clearTimer, stop]);

  const reset = useCallback(() => {
    clearTimer();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    chunksRef.current = [];
    setAudioBlob(null);
    setAudioUrl(null);
    setElapsedSeconds(0);
    setStatus("idle");
    setError(null);
  }, [audioUrl, clearTimer]);

  useEffect(() => {
    return () => {
      clearTimer();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    elapsedSeconds,
    audioBlob,
    audioUrl,
    error,
    start,
    stop,
    reset,
    maxSeconds: MAX_RECORDING_SECONDS,
  };
}
