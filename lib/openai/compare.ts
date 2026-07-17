import { getOpenAIClient } from "@/lib/openai/client";
import { ComparisonResult, SpeechAnalysis } from "@/lib/types/analysis";

const SYSTEM_PROMPT = `You are a speech coach comparing two attempts at the same prompt. Attempt 2 was recorded immediately after attempt 1, following a specific practice drill. You are given both attempts' analyses as JSON.

For each dimension, judge whether attempt 2 was "improved", "same", or "regressed" relative to attempt 1:
- time_to_point: lower time_to_point_seconds is better (faster to the main point). If either is null, judge from context.
- filler_words: fewer filler_word_count is better.
- repetition: lower repetition_count is better.
- stutters: lower stutter_count is better.
- structure: judge from structure_detected/structure_suggested and biggest_weakness/strongest_skill whether organization got clearer.
- conciseness: judge from avg_sentence_length, repetition_count, and overall answer quality whether the answer became tighter.
- use_of_examples: judge whether attempt 2 used examples as well as or better than attempt 1.
- conclusion_clarity: judge whether the ending/conclusion became clearer or stayed weak.
- speaking_pace: judge only if pace changed meaningfully; a comfortable pace in both counts as "same".

Then write a short (2-4 sentence) plain-language summary in a coaching tone, referencing at least one concrete improvement and, if honest, one thing that's still not resolved. Do not rewrite their content — only comment on communication patterns. Example tone: "Your second answer reached the main point 22 seconds faster and used fewer repeated ideas. However, your conclusion was less clear than in attempt 1."`;

const JSON_SCHEMA = {
  name: "attempt_comparison",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string" },
      dimensions: {
        type: "object",
        additionalProperties: false,
        properties: {
          time_to_point: { type: "string", enum: ["improved", "same", "regressed"] },
          filler_words: { type: "string", enum: ["improved", "same", "regressed"] },
          repetition: { type: "string", enum: ["improved", "same", "regressed"] },
          stutters: { type: "string", enum: ["improved", "same", "regressed"] },
          structure: { type: "string", enum: ["improved", "same", "regressed"] },
          conciseness: { type: "string", enum: ["improved", "same", "regressed"] },
          use_of_examples: { type: "string", enum: ["improved", "same", "regressed"] },
          conclusion_clarity: { type: "string", enum: ["improved", "same", "regressed"] },
          speaking_pace: { type: "string", enum: ["improved", "same", "regressed"] },
        },
        required: [
          "time_to_point",
          "filler_words",
          "repetition",
          "stutters",
          "structure",
          "conciseness",
          "use_of_examples",
          "conclusion_clarity",
          "speaking_pace",
        ],
      },
    },
    required: ["summary", "dimensions"],
  },
} as const;

function diff(a: number | null, b: number | null): number | null {
  if (a === null || b === null) return null;
  return Math.round((b - a) * 10) / 10;
}

export async function compareAttempts(
  attempt1: SpeechAnalysis,
  attempt2: SpeechAnalysis,
  promptText: string,
  lang: "en" | "es" = "en"
): Promise<ComparisonResult> {
  const client = getOpenAIClient();

  const languageNote =
    lang === "es" ? '\n\nWrite the "summary" field in Spanish, not English.' : "";

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Prompt: "${promptText}"${languageNote}\n\nAttempt 1 analysis:\n${JSON.stringify(attempt1)}\n\nAttempt 2 analysis:\n${JSON.stringify(attempt2)}`,
      },
    ],
    response_format: { type: "json_schema", json_schema: JSON_SCHEMA },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The comparison response was empty.");
  }

  const raw = JSON.parse(content) as Pick<ComparisonResult, "summary" | "dimensions">;

  return {
    ...raw,
    metrics_diff: {
      time_to_point_seconds: diff(
        attempt1.metrics.time_to_point_seconds,
        attempt2.metrics.time_to_point_seconds
      ),
      filler_word_count: attempt2.metrics.filler_word_count - attempt1.metrics.filler_word_count,
      repetition_count: attempt2.metrics.repetition_count - attempt1.metrics.repetition_count,
      stutter_count: attempt2.metrics.stutter_count - attempt1.metrics.stutter_count,
      speaking_pace_wpm: diff(
        attempt1.metrics.speaking_pace_wpm,
        attempt2.metrics.speaking_pace_wpm
      ),
    },
  };
}
