"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressSteps } from "@/components/session/ProgressSteps";
import { ThinkingTimer } from "@/components/session/ThinkingTimer";
import { RecorderPanel } from "@/components/session/RecorderPanel";
import { AudioPlayback } from "@/components/session/AudioPlayback";
import { TranscriptView } from "@/components/session/TranscriptView";
import { getRandomPrompt } from "@/lib/prompts/seedPrompts";

type Stage = "thinking" | "recording" | "recorded" | "transcribing" | "done";

const STEPS = ["Prompt", "Record", "Listen", "Transcript"];

const STAGE_TO_STEP_INDEX: Record<Stage, number> = {
  thinking: 0,
  recording: 1,
  recorded: 2,
  transcribing: 3,
  done: 3,
};

export default function SessionPage() {
  const prompt = useMemo(() => getRandomPrompt(), []);
  const [stage, setStage] = useState<Stage>("thinking");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcribeError, setTranscribeError] = useState<string | null>(null);

  const handleRecorded = (blob: Blob, url: string) => {
    setAudioBlob(blob);
    setAudioUrl(url);
    setStage("recorded");
  };

  const submitForTranscription = async () => {
    if (!audioBlob) return;
    setStage("transcribing");
    setTranscribeError(null);

    try {
      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const res = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Transcription failed.");
      }

      setTranscript(data.text);
      setStage("done");
    } catch (err) {
      setTranscribeError(
        err instanceof Error ? err.message : "Transcription failed. Please try again."
      );
      setStage("recorded");
    }
  };

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <ProgressSteps steps={STEPS} currentIndex={STAGE_TO_STEP_INDEX[stage]} />

      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          Today&apos;s prompt
        </span>
        <p className="text-2xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          {prompt.text}
        </p>
      </Card>

      <Card>
        {stage === "thinking" && (
          <ThinkingTimer onDone={() => setStage("recording")} />
        )}

        {stage === "recording" && <RecorderPanel onRecorded={handleRecorded} />}

        {stage === "recorded" && audioUrl && (
          <div className="flex flex-col items-center gap-6">
            <AudioPlayback audioUrl={audioUrl} />
            {transcribeError && (
              <p className="text-sm text-red-600 dark:text-red-400">{transcribeError}</p>
            )}
            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStage("recording")}>
                Record again
              </Button>
              <Button onClick={submitForTranscription}>Submit for transcription</Button>
            </div>
          </div>
        )}

        {stage === "transcribing" && audioUrl && (
          <div className="flex flex-col items-center gap-6">
            <AudioPlayback audioUrl={audioUrl} />
            <TranscriptView status="transcribing" />
          </div>
        )}

        {stage === "done" && audioUrl && transcript && (
          <div className="flex flex-col gap-6">
            <AudioPlayback audioUrl={audioUrl} />
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                Transcript
              </span>
              <TranscriptView status="done" text={transcript} />
            </div>
          </div>
        )}
      </Card>

      {stage === "done" && (
        <div className="flex justify-between">
          <Link href="/">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
          <Link href="/session">
            <Button variant="secondary">Start another prompt</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
