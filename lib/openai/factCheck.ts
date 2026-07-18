import { getOpenAIClient } from "@/lib/openai/client";
import { FactCheckClaim, FactCheckResult } from "@/lib/types/factCheck";

const SYSTEM_PROMPT = `You are a fact-checker reviewing a transcript of something someone said out loud in a speaking-practice exercise.

Steps:
1. Extract only objective, externally checkable factual claims: specific numbers, dates, historical events, scientific claims, statistics. Do NOT extract opinions, predictions, value judgments, or personal experiences - those cannot be fact-checked.
2. For each claim, use web search to find current, reliable sources.
3. Decide a verdict: "true", "false", "misleading" (technically true but missing important context that changes the picture), or "unverifiable" (no reliable source found either way).
4. Be conservative - only mark something "false" or "misleading" if your sources clearly support that; otherwise use "unverifiable".
5. If the transcript contains no checkable factual claims, return an empty claims array. Do not invent claims.

Respond with ONLY a JSON object (no markdown code fences, no commentary) in exactly this shape:
{"claims": [{"claim": string, "verdict": "true"|"false"|"misleading"|"unverifiable", "explanation": string (1-2 sentences), "sources": [{"title": string, "url": string}]}]}`;

function parseJsonLoose(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(trimmed);
}

export async function factCheckTranscript(
  transcript: string,
  lang: "en" | "es" = "en"
): Promise<FactCheckResult> {
  const client = getOpenAIClient();

  const languageNote =
    lang === "es" ? " Write claim, explanation, and source titles in Spanish." : "";

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    tools: [{ type: "web_search" }],
    instructions: SYSTEM_PROMPT + languageNote,
    input: `Transcript:\n"""\n${transcript}\n"""`,
  });

  const text = response.output_text;
  if (!text) {
    throw new Error("The fact-check response was empty.");
  }

  try {
    const parsed = parseJsonLoose(text) as { claims?: FactCheckClaim[] };
    return { claims: Array.isArray(parsed.claims) ? parsed.claims : [] };
  } catch {
    return { claims: [] };
  }
}
