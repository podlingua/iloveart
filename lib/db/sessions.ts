import { createClient } from "@/lib/supabase/client";
import { ComparisonResult, Drill, SpeechAnalysis } from "@/lib/types/analysis";

export async function createSession(userId: string, promptId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: userId, prompt_id: promptId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

function extensionForMimeType(mimeType: string): string {
  if (mimeType.includes("mp4")) return "mp4";
  if (mimeType.includes("ogg")) return "ogg";
  return "webm";
}

export async function uploadRecording(
  userId: string,
  sessionId: string,
  attemptNumber: 1 | 2,
  blob: Blob
): Promise<string> {
  const supabase = createClient();
  const ext = extensionForMimeType(blob.type);
  const path = `${userId}/${sessionId}/attempt-${attemptNumber}.${ext}`;
  const { error } = await supabase.storage.from("recordings").upload(path, blob, {
    contentType: blob.type || "audio/webm",
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function saveRecording(
  sessionId: string,
  attemptNumber: 1 | 2,
  storagePath: string,
  durationSeconds: number
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("recordings")
    .insert({
      session_id: sessionId,
      attempt_number: attemptNumber,
      storage_path: storagePath,
      duration_seconds: durationSeconds,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function saveTranscript(recordingId: string, text: string): Promise<string> {
  const supabase = createClient();
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const { data, error } = await supabase
    .from("transcripts")
    .insert({ recording_id: recordingId, text, word_count: wordCount })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function saveAnalysis(
  recordingId: string,
  transcriptId: string,
  analysis: SpeechAnalysis
): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("ai_analyses")
    .insert({
      recording_id: recordingId,
      transcript_id: transcriptId,
      main_point_summary: analysis.main_point_summary,
      structure_detected: analysis.structure_detected,
      structure_suggested: analysis.structure_suggested,
      strongest_skill: analysis.strongest_skill,
      biggest_weakness: analysis.biggest_weakness,
      weakness_type: analysis.weakness_type,
      metrics: analysis.metrics,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function updateAnalysisConfirmation(
  analysisId: string,
  confirmed: boolean
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("ai_analyses")
    .update({ user_confirmed_meaning: confirmed })
    .eq("id", analysisId);
  if (error) throw error;
}

export async function saveDrill(
  sessionId: string,
  analysisId: string,
  drill: Drill
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("drills").insert({
    session_id: sessionId,
    analysis_id: analysisId,
    drill_type: drill.type,
    instructions: drill.instructions,
  });
  if (error) throw error;
}

export async function saveComparison(
  sessionId: string,
  analysis1Id: string,
  analysis2Id: string,
  comparison: ComparisonResult
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("attempt_comparisons").insert({
    session_id: sessionId,
    analysis_1_id: analysis1Id,
    analysis_2_id: analysis2Id,
    summary: comparison.summary,
    metrics_diff: { dimensions: comparison.dimensions, ...comparison.metrics_diff },
  });
  if (error) throw error;
}

export async function completeSession(sessionId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("sessions")
    .update({ status: "completed", completed_at: new Date().toISOString() })
    .eq("id", sessionId);
  if (error) throw error;
}

export interface SessionHistoryRow {
  id: string;
  prompt_id: string | null;
  status: string;
  created_at: string;
  completed_at: string | null;
  prompts: { text: string } | null;
}

export async function listSessions(userId: string): Promise<SessionHistoryRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("sessions")
    .select("id, prompt_id, status, created_at, completed_at, prompts ( text )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as SessionHistoryRow[];
}
