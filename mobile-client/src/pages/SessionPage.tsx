import { Suspense, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ProgressSteps } from "@/components/session/ProgressSteps";
import { ThinkingTimer } from "@/components/session/ThinkingTimer";
import { RecorderPanel } from "@/components/session/RecorderPanel";
import { AudioPlayback } from "@/components/session/AudioPlayback";
import { TranscriptView } from "@/components/session/TranscriptView";
import { FeedbackPanel } from "@/components/session/FeedbackPanel";
import { DrillCard } from "@/components/session/DrillCard";
import { ComparisonView } from "@/components/session/ComparisonView";
import { FactCheckCard } from "@/components/session/FactCheckCard";
import { createCustomPrompt, getRandomPrompt, Prompt } from "@/lib/prompts/seedPrompts";
import { getStructureOption } from "@/lib/prompts/structures";
import { readAndClearSource } from "@/lib/prompts/sourceStorage";
import { ComparisonResult, Drill, SpeechAnalysis } from "@/lib/types/analysis";
import { FactCheckResult } from "@/lib/types/factCheck";
import { useSessionPersistence } from "@/hooks/useSessionPersistence";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { analyzeTranscript, compareAttempts, factCheck, transcribeAudio } from "@/lib/api/client";

type Stage =
  | "thinking"
  | "recording1"
  | "recorded1"
  | "transcribing1"
  | "analyzing1"
  | "feedback"
  | "recording2"
  | "recorded2"
  | "transcribing2"
  | "analyzing2"
  | "comparing"
  | "compared";

const STAGE_TO_STEP_INDEX: Record<Stage, number> = {
  thinking: 0,
  recording1: 1,
  recorded1: 2,
  transcribing1: 2,
  analyzing1: 3,
  feedback: 4,
  recording2: 5,
  recorded2: 5,
  transcribing2: 5,
  analyzing2: 6,
  comparing: 6,
  compared: 6,
};

interface AttemptState {
  audioBlob: Blob | null;
  audioUrl: string | null;
  durationSeconds: number;
  transcript: string | null;
  analysis: SpeechAnalysis | null;
}

const EMPTY_ATTEMPT: AttemptState = {
  audioBlob: null,
  audioUrl: null,
  durationSeconds: 0,
  transcript: null,
  analysis: null,
};

export default function SessionPage() {
  return (
    <Suspense fallback={null}>
      <SessionPageInner />
    </Suspense>
  );
}

function SessionPageInner() {
  const [searchParams] = useSearchParams();
  const { lang, t } = useLanguage();
  const customTopic = searchParams.get("topic");
  const hasSourceParam = searchParams.get("source") === "1";
  const [sourcePrompt, setSourcePrompt] = useState<Prompt | null>(null);
  const [referenceMaterial, setReferenceMaterial] = useState<string | null>(null);
  const [sourceLoaded, setSourceLoaded] = useState(!hasSourceParam);

  useEffect(() => {
    // One-time hydration of the uploaded source from sessionStorage after
    // mount, since it can't fit in a URL.
    if (!hasSourceParam) return;
    const source = readAndClearSource();
    if (source) {
      setSourcePrompt(createCustomPrompt(source.topic));
      setReferenceMaterial(source.summary);
    }
    setSourceLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const prompt = useMemo(() => {
    if (hasSourceParam) return sourcePrompt ?? createCustomPrompt("…");
    return customTopic?.trim() ? createCustomPrompt(customTopic.trim()) : getRandomPrompt(lang);
  }, [customTopic, lang, hasSourceParam, sourcePrompt]);
  const structure = useMemo(
    () => getStructureOption(searchParams.get("structure"), lang),
    [searchParams, lang]
  );
  const factCheckEnabled = searchParams.get("factcheck") === "1";
  const [stage, setStage] = useState<Stage>("thinking");
  const [attempt1, setAttempt1] = useState<AttemptState>(EMPTY_ATTEMPT);
  const [attempt2, setAttempt2] = useState<AttemptState>(EMPTY_ATTEMPT);
  const [drill, setDrill] = useState<Drill | null>(null);
  const [confirmedMeaning, setConfirmedMeaning] = useState<boolean | null>(null);
  const [comparison, setComparison] = useState<ComparisonResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [factCheckStatus, setFactCheckStatus] = useState<"checking" | "done" | "error" | null>(
    null
  );
  const [factCheckResult, setFactCheckResult] = useState<FactCheckResult | null>(null);
  const persistence = useSessionPersistence(prompt);
  const { session } = useAuth();
  const accessToken = session?.access_token ?? null;

  const runFactCheck = (transcript: string) => {
    setFactCheckStatus("checking");
    factCheck(transcript, lang, accessToken)
      .then((result) => {
        setFactCheckResult(result);
        setFactCheckStatus("done");
      })
      .catch(() => {
        setFactCheckStatus("error");
      });
  };

  const runTranscribeAndAnalyze = async (
    blob: Blob,
    url: string,
    durationSeconds: number,
    attemptNumber: 1 | 2
  ) => {
    const setAttempt = attemptNumber === 1 ? setAttempt1 : setAttempt2;
    setAttempt({ audioBlob: blob, audioUrl: url, durationSeconds, transcript: null, analysis: null });
    setStage(attemptNumber === 1 ? "transcribing1" : "transcribing2");
    setErrorMessage(null);

    try {
      const transcript = await transcribeAudio(blob, lang, accessToken);
      setAttempt((prev) => ({ ...prev, transcript }));
      setStage(attemptNumber === 1 ? "analyzing1" : "analyzing2");

      if (attemptNumber === 1 && factCheckEnabled) {
        runFactCheck(transcript);
      }

      const { analysis, drill: newDrill } = await analyzeTranscript(
        transcript,
        durationSeconds,
        lang,
        accessToken,
        attemptNumber === 1 && structure.id !== "auto" ? structure.description : undefined,
        attemptNumber === 1 ? (referenceMaterial ?? undefined) : undefined
      );
      setAttempt((prev) => ({ ...prev, analysis }));

      if (attemptNumber === 1) {
        setDrill(newDrill);
        setStage("feedback");
        persistence.persistAttempt(1, { blob, durationSeconds, transcript, analysis }).then(() => {
          persistence.persistDrill(newDrill);
        });
      } else {
        setStage("comparing");
        try {
          const result = await compareAttempts(
            attempt1.analysis as SpeechAnalysis,
            analysis,
            prompt.text,
            lang,
            accessToken
          );
          setComparison(result);
          setStage("compared");
          persistence.persistAttempt(2, { blob, durationSeconds, transcript, analysis }).then(() => {
            persistence.persistComparisonAndComplete(result);
          });
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : "Comparison failed.");
          setStage("recorded2");
        }
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStage(attemptNumber === 1 ? "recorded1" : "recorded2");
    }
  };

  const retryAnalysis = async (attemptNumber: 1 | 2) => {
    const attempt = attemptNumber === 1 ? attempt1 : attempt2;
    if (!attempt.transcript) return;
    setStage(attemptNumber === 1 ? "analyzing1" : "analyzing2");
    setErrorMessage(null);
    try {
      const { analysis, drill: newDrill } = await analyzeTranscript(
        attempt.transcript,
        attempt.durationSeconds,
        lang,
        accessToken,
        attemptNumber === 1 && structure.id !== "auto" ? structure.description : undefined,
        attemptNumber === 1 ? (referenceMaterial ?? undefined) : undefined
      );
      const setAttempt = attemptNumber === 1 ? setAttempt1 : setAttempt2;
      setAttempt((prev) => ({ ...prev, analysis }));
      if (attemptNumber === 1) {
        setDrill(newDrill);
        setStage("feedback");
      } else {
        setStage("comparing");
        const result = await compareAttempts(
          attempt1.analysis as SpeechAnalysis,
          analysis,
          prompt.text,
          lang,
          accessToken
        );
        setComparison(result);
        setStage("compared");
      }
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Something went wrong.");
      setStage(attemptNumber === 1 ? "recorded1" : "recorded2");
    }
  };

  if (!sourceLoaded) {
    return (
      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 py-12">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.session.loadingSource}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-12">
      <ProgressSteps steps={t.progress.steps} currentIndex={STAGE_TO_STEP_INDEX[stage]} />

      <Card className="flex flex-col gap-4">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          {prompt.category === "custom" ? t.session.yourTopic : t.session.todaysPrompt}
        </span>
        <p className="text-2xl font-semibold leading-snug text-zinc-900 dark:text-zinc-100">
          {prompt.text}
        </p>
      </Card>

      {referenceMaterial && (
        <Card className="flex flex-col gap-1 border-zinc-300 dark:border-zinc-700">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
            {t.session.referenceMaterial}
          </span>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{referenceMaterial}</p>
        </Card>
      )}

      {structure.id !== "auto" &&
        (stage === "thinking" ||
          stage === "recording1" ||
          stage === "recorded1" ||
          stage === "transcribing1" ||
          stage === "analyzing1") && (
          <Card className="flex flex-col gap-1 border-zinc-300 dark:border-zinc-700">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
              {t.session.tryThisStructure}
            </span>
            <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
              {structure.label}
            </span>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{structure.description}</p>
          </Card>
        )}

      {(stage === "thinking" ||
        stage === "recording1" ||
        stage === "recorded1" ||
        stage === "transcribing1" ||
        stage === "analyzing1") && (
        <Card>
          {stage === "thinking" && <ThinkingTimer onDone={() => setStage("recording1")} />}

          {stage === "recording1" && (
            <RecorderPanel
              onRecorded={(blob, url, seconds) =>
                runTranscribeAndAnalyze(blob, url, seconds, 1)
              }
            />
          )}

          {stage === "recorded1" && attempt1.audioUrl && (
            <div className="flex flex-col items-center gap-6">
              <AudioPlayback audioUrl={attempt1.audioUrl} />
              {errorMessage && (
                <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setStage("recording1")}>
                  {t.session.recordAgain}
                </Button>
                <Button
                  onClick={() =>
                    attempt1.transcript
                      ? retryAnalysis(1)
                      : attempt1.audioBlob &&
                        runTranscribeAndAnalyze(
                          attempt1.audioBlob,
                          attempt1.audioUrl!,
                          attempt1.durationSeconds,
                          1
                        )
                  }
                >
                  {attempt1.transcript ? t.session.retryAnalysis : t.session.submitForTranscription}
                </Button>
              </div>
            </div>
          )}

          {stage === "transcribing1" && attempt1.audioUrl && (
            <div className="flex flex-col items-center gap-6">
              <AudioPlayback audioUrl={attempt1.audioUrl} />
              <TranscriptView status="transcribing" />
            </div>
          )}

          {stage === "analyzing1" && attempt1.audioUrl && (
            <div className="flex flex-col gap-6">
              <AudioPlayback audioUrl={attempt1.audioUrl} />
              {attempt1.transcript && (
                <TranscriptView status="done" text={attempt1.transcript} />
              )}
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.session.analyzing}</p>
            </div>
          )}
        </Card>
      )}

      {stage === "feedback" && attempt1.analysis && drill && (
        <div className="flex flex-col gap-6">
          <FeedbackPanel
            analysis={attempt1.analysis}
            confirmedMeaning={confirmedMeaning}
            onConfirm={(confirmed) => {
              setConfirmedMeaning(confirmed);
              persistence.confirmMeaning(confirmed);
            }}
          />
          {factCheckStatus && (
            <FactCheckCard
              status={factCheckStatus}
              result={factCheckResult}
              onRetry={() => attempt1.transcript && runFactCheck(attempt1.transcript)}
            />
          )}
          <DrillCard drill={drill} onStart={() => setStage("recording2")} />
        </div>
      )}

      {(stage === "recording2" ||
        stage === "recorded2" ||
        stage === "transcribing2" ||
        stage === "analyzing2") && (
        <>
          {drill && (
            <Card className="flex flex-col gap-2 border-zinc-300 dark:border-zinc-700">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                {drill.label} {t.session.attempt2Suffix}
              </span>
              <p className="text-sm text-zinc-700 dark:text-zinc-300">{drill.instructions}</p>
            </Card>
          )}

          <Card>
            {stage === "recording2" && (
              <RecorderPanel
                onRecorded={(blob, url, seconds) =>
                  runTranscribeAndAnalyze(blob, url, seconds, 2)
                }
              />
            )}

            {stage === "recorded2" && attempt2.audioUrl && (
              <div className="flex flex-col items-center gap-6">
                <AudioPlayback audioUrl={attempt2.audioUrl} />
                {errorMessage && (
                  <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
                )}
                <div className="flex gap-3">
                  <Button variant="secondary" onClick={() => setStage("recording2")}>
                    {t.session.recordAgain}
                  </Button>
                  <Button
                    onClick={() =>
                      attempt2.transcript
                        ? retryAnalysis(2)
                        : attempt2.audioBlob &&
                          runTranscribeAndAnalyze(
                            attempt2.audioBlob,
                            attempt2.audioUrl!,
                            attempt2.durationSeconds,
                            2
                          )
                    }
                  >
                    {attempt2.transcript ? t.session.retry : t.session.submitForTranscription}
                  </Button>
                </div>
              </div>
            )}

            {stage === "transcribing2" && attempt2.audioUrl && (
              <div className="flex flex-col items-center gap-6">
                <AudioPlayback audioUrl={attempt2.audioUrl} />
                <TranscriptView status="transcribing" />
              </div>
            )}

            {stage === "analyzing2" && attempt2.audioUrl && (
              <div className="flex flex-col gap-6">
                <AudioPlayback audioUrl={attempt2.audioUrl} />
                {attempt2.transcript && (
                  <TranscriptView status="done" text={attempt2.transcript} />
                )}
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.session.analyzing}</p>
              </div>
            )}
          </Card>
        </>
      )}

      {stage === "comparing" && (
        <Card>
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
            {t.session.comparingAttempts}
          </p>
        </Card>
      )}

      {stage === "compared" && comparison && (
        <>
          <ComparisonView comparison={comparison} />
          <div className="flex justify-between">
            <Link to="/">
              <Button variant="ghost">{t.session.backToDashboard}</Button>
            </Link>
            <Link to="/session">
              <Button variant="secondary">{t.session.startAnotherPrompt}</Button>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
