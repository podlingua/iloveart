import { ExtractedSource } from "@/lib/types/source";

const STORAGE_KEY = "speech-coach-source";

export function saveSource(source: ExtractedSource) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(source));
}

export function readAndClearSource(): ExtractedSource | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.topic === "string" && typeof parsed?.summary === "string") {
      return parsed as ExtractedSource;
    }
    return null;
  } catch {
    return null;
  }
}
