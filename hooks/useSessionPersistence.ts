"use client";

import { useCallback, useRef } from "react";
import { useAuth } from "@/lib/supabase/AuthProvider";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  completeSession,
  createSession,
  saveAnalysis,
  saveComparison,
  saveDrill,
  saveRecording,
  saveTranscript,
  updateAnalysisConfirmation,
  uploadRecording,
} from "@/lib/db/sessions";
import { ComparisonResult, Drill, SpeechAnalysis } from "@/lib/types/analysis";

interface AttemptPayload {
  blob: Blob;
  durationSeconds: number;
  transcript: string;
  analysis: SpeechAnalysis;
}

export function useSessionPersistence(promptId: string) {
  const { user } = useAuth();
  const sessionIdRef = useRef<string | null>(null);
  const analysisIdsRef = useRef<{ 1?: string; 2?: string }>({});

  const ensureSession = useCallback(async () => {
    if (!isSupabaseConfigured || !user) return null;
    if (sessionIdRef.current) return sessionIdRef.current;
    const id = await createSession(user.id, promptId);
    sessionIdRef.current = id;
    return id;
  }, [user, promptId]);

  const persistAttempt = useCallback(
    async (attemptNumber: 1 | 2, data: AttemptPayload) => {
      if (!isSupabaseConfigured || !user) return null;
      try {
        const sessionId = await ensureSession();
        if (!sessionId) return null;
        const storagePath = await uploadRecording(user.id, sessionId, attemptNumber, data.blob);
        const recordingId = await saveRecording(
          sessionId,
          attemptNumber,
          storagePath,
          data.durationSeconds
        );
        const transcriptId = await saveTranscript(recordingId, data.transcript);
        const analysisId = await saveAnalysis(recordingId, transcriptId, data.analysis);
        analysisIdsRef.current[attemptNumber] = analysisId;
        return analysisId;
      } catch (err) {
        console.error("Persistence failed:", err);
        return null;
      }
    },
    [user, ensureSession]
  );

  const persistDrill = useCallback(
    async (drill: Drill) => {
      if (!isSupabaseConfigured || !user) return;
      const sessionId = sessionIdRef.current;
      const analysisId = analysisIdsRef.current[1];
      if (!sessionId || !analysisId) return;
      try {
        await saveDrill(sessionId, analysisId, drill);
      } catch (err) {
        console.error("Persistence failed:", err);
      }
    },
    [user]
  );

  const confirmMeaning = useCallback(
    async (confirmed: boolean) => {
      if (!isSupabaseConfigured || !user) return;
      const analysisId = analysisIdsRef.current[1];
      if (!analysisId) return;
      try {
        await updateAnalysisConfirmation(analysisId, confirmed);
      } catch (err) {
        console.error("Persistence failed:", err);
      }
    },
    [user]
  );

  const persistComparisonAndComplete = useCallback(
    async (comparison: ComparisonResult) => {
      if (!isSupabaseConfigured || !user) return;
      const sessionId = sessionIdRef.current;
      const id1 = analysisIdsRef.current[1];
      const id2 = analysisIdsRef.current[2];
      try {
        if (sessionId && id1 && id2) {
          await saveComparison(sessionId, id1, id2, comparison);
        }
        if (sessionId) {
          await completeSession(sessionId);
        }
      } catch (err) {
        console.error("Persistence failed:", err);
      }
    },
    [user]
  );

  return { persistAttempt, persistDrill, confirmMeaning, persistComparisonAndComplete };
}
