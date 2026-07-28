import { apiUrl } from "@/lib/api/config";
import { extensionForMimeType } from "@/lib/audio/mimeType";
import type { Lang } from "@/lib/i18n/LanguageProvider";
import type { ComparisonResult, Drill, SpeechAnalysis } from "@/lib/types/analysis";
import type { FactCheckResult } from "@/lib/types/factCheck";
import type { ExtractedSource } from "@/lib/types/source";

function authHeaders(accessToken: string | null): HeadersInit {
  return accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
}

// Wraps every fetch() call site so a thrown error (bad URL, network failure,
// or anything else) is logged with its full name/message/stack before being
// re-thrown for the caller (SessionPage) to surface in the UI. TEMPORARY
// diagnostic logging - safe to trim once the stop-recording bug is confirmed
// fixed on a real device.
async function loggedFetch(label: string, url: string, init: RequestInit): Promise<Response> {
  console.log(`[api:${label}] fetching`, { url, method: init.method });
  try {
    const res = await fetch(url, init);
    console.log(`[api:${label}] response`, { url, status: res.status, ok: res.ok });
    return res;
  } catch (err) {
    const e = err as Error;
    console.error(`[api:${label}] fetch threw`, {
      url,
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    });
    throw err;
  }
}

export async function transcribeAudio(
  blob: Blob,
  lang: Lang,
  accessToken: string | null
): Promise<string> {
  console.log("[transcribeAudio] input blob", { type: blob.type, size: blob.size });
  if (!blob || blob.size === 0) {
    throw new Error(
      `Recorded audio is empty (size=${blob?.size ?? "undefined"}, type=${blob?.type ?? "undefined"}). ` +
        "The microphone may not have captured any audio."
    );
  }
  if (!blob.type) {
    console.warn("[transcribeAudio] Blob has no MIME type - falling back to webm extension.");
  }

  const formData = new FormData();
  const filename = `recording.${extensionForMimeType(blob.type)}`;
  console.log("[transcribeAudio] filename", filename);
  formData.append("audio", blob, filename);
  formData.append("lang", lang);

  const url = apiUrl("/api/transcribe");
  const res = await loggedFetch("transcribe", url, {
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
  const url = apiUrl("/api/analyze");
  const res = await loggedFetch("analyze", url, {
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
  const url = apiUrl("/api/fact-check");
  const res = await loggedFetch("factCheck", url, {
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
  const url = apiUrl("/api/compare");
  const res = await loggedFetch("compare", url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ attempt1, attempt2, promptText, lang }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Comparison failed.");
  return data.comparison;
}

export async function deleteAccount(accessToken: string): Promise<void> {
  const url = apiUrl("/api/delete-account");
  const res = await loggedFetch("deleteAccount", url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(accessToken) },
    body: JSON.stringify({ confirm: "DELETE" }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Account deletion failed.");
  }
}

export async function extractSource(
  file: File,
  lang: Lang,
  accessToken: string | null
): Promise<ExtractedSource> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("lang", lang);
  const url = apiUrl("/api/extract-source");
  const res = await loggedFetch("extractSource", url, {
    method: "POST",
    body: formData,
    headers: authHeaders(accessToken),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Source extraction failed.");
  return data.source;
}
