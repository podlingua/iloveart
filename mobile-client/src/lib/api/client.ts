import { apiUrl } from "@/lib/api/config";
import { extensionForMimeType } from "@/lib/audio/mimeType";
import type { Lang } from "@/lib/i18n/LanguageProvider";
import type { ComparisonResult, Drill, SpeechAnalysis } from "@/lib/types/analysis";
import type { FactCheckResult } from "@/lib/types/factCheck";
import type { ExtractedSource } from "@/lib/types/source";

function authHeaders(accessToken: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

export async function transcribeAudio(
  blob: Blob,
  lang: Lang,
  accessToken: string | null
): Promise<string> {
  const formData = new FormData();
  const filename = `recording.${extensionForMimeType(blob.type)}`;
  formData.append("audio", blob, filename);
  formData.append("lang", lang);
  const res = await fetch(apiUrl("/api/transcribe"), {
    method: "POST",
    body: formData,
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Transcription failed.");
  return data.text;
}

export async function analyzeTranscript(
  transcript: string,
  durationSeconds: number,
  lang: Lang,
  accessToken: string | null,
  targetStructure?: string,
  referenceMaterial?: string
): Promise<{ analysis: SpeechAnalysis; drill: Drill }> {
  const res = await fetch(apiUrl("/api/analyze"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ transcript, durationSeconds, targetStructure, referenceMaterial, lang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Analysis failed.");
  return data;
}

export async function factCheck(
  transcript: string,
  lang: Lang,
  accessToken: string | null
): Promise<FactCheckResult> {
  const res = await fetch(apiUrl("/api/fact-check"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ transcript, lang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Fact-check failed.");
  return data.factCheck;
}

export async function compareAttempts(
  attempt1: SpeechAnalysis,
  attempt2: SpeechAnalysis,
  promptText: string,
  lang: Lang,
  accessToken: string | null
): Promise<ComparisonResult> {
  const res = await fetch(apiUrl("/api/compare"), {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ attempt1, attempt2, promptText, lang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Comparison failed.");
  return data.comparison;
}

export async function extractSource(
  file: File,
  lang: Lang,
  accessToken: string | null
): Promise<ExtractedSource> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("lang", lang);
  const res = await fetch(apiUrl("/api/extract-source"), {
    method: "POST",
    body: formData,
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Source extraction failed.");
  return data.source;
}
