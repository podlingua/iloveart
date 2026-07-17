import { getOpenAIClient } from "@/lib/openai/client";
import { SpeechAnalysis } from "@/lib/types/analysis";

const SYSTEM_PROMPT = `You are a speech and communication coach, not a ghostwriter. A user recorded a spoken answer to a prompt; you are given the transcript. Your job is to help them notice patterns in their OWN speech, not to rewrite what they said into perfect language.

Rules:
- Never rewrite their answer for them.
- Identify exactly ONE strongest skill and exactly ONE biggest weakness. Do not list multiple weaknesses.
- Do not treat every pause, repetition, or disfluency as a failure — this is a communication training tool, not a medical diagnostic tool. Casual speech is normal; only flag patterns that actually hurt clarity.
- "structure_detected" should break the transcript into a short sequence of 3-6 labeled beats describing what actually happened, in the speaker's real order, e.g. ["Main Claim","Reason","Example","Tangent","Repeated Claim","Conclusion"]. This is a best-effort approximation, not a precise algorithm.
- "structure_suggested" should be a short sequence (3-5 beats) showing a clearer version of the same content, e.g. ["Main Claim","Reason 1","Example","Reason 2","Conclusion"].
- "weakness_type" must be the single drill category that best addresses the biggest weakness:
  - "lead_with_point": the speaker took too long to state their position or buried the main claim.
  - "precision": the speaker relied on vague language (thing, stuff, something, kind of, you know) instead of specific words.
  - "structure": the ideas were not clearly organized or connected (tangents, unclear ordering, unfinished thoughts).
  - "compression": the answer was repetitive, rambling, or much longer than it needed to be.
- Metrics are holistic judgments from reading the transcript, not exact algorithmic counts. Use your judgment about what's actually disruptive versus normal spoken language.
- "stutter_count" counts stutter-like disfluencies visible in the transcript text: repeated word fragments or whole words at the start of an utterance (e.g. "I- I- I think", "the the point"), and sound/syllable repetitions written out in the transcript (e.g. "b-b-but"). This is a transcript-based estimate only — it cannot detect audio-only patterns like blocks or prolonged sounds that a transcript doesn't capture. Do not count ordinary filler words ("um", "uh") or normal restarts here; those are covered by filler_word_count and restart_count.`;

const JSON_SCHEMA = {
  name: "speech_analysis",
  strict: true,
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      main_point_summary: {
        type: "string",
        description: "One or two sentences summarizing the speaker's main argument.",
      },
      structure_detected: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 6,
      },
      structure_suggested: {
        type: "array",
        items: { type: "string" },
        minItems: 3,
        maxItems: 5,
      },
      strongest_skill: {
        type: "string",
        description: "One specific thing the speaker did well, with a concrete reason why.",
      },
      biggest_weakness: {
        type: "string",
        description: "The single primary weakness for this session, stated plainly.",
      },
      weakness_type: {
        type: "string",
        enum: ["lead_with_point", "precision", "structure", "compression"],
      },
      metrics: {
        type: "object",
        additionalProperties: false,
        properties: {
          time_to_point_seconds: {
            type: ["number", "null"],
            description:
              "Estimated seconds from the start of the response until the main point is clearly stated, based on the position of that sentence in the transcript relative to total duration. Null if the main point is never clearly stated.",
          },
          filler_word_count: { type: "integer" },
          repetition_count: {
            type: "integer",
            description: "Number of times a core idea was repeated, not counting normal emphasis.",
          },
          avg_sentence_length: {
            type: "number",
            description: "Average words per sentence.",
          },
          vague_term_count: {
            type: "integer",
            description: 'Count of vague words/phrases like "thing", "stuff", "something", "kind of".',
          },
          restart_count: {
            type: "integer",
            description: "Number of abandoned or restarted sentences.",
          },
          stutter_count: {
            type: "integer",
            description:
              "Count of stutter-like word/sound repetitions visible in the transcript text (e.g. \"I- I- I\", \"b-b-but\"), not ordinary filler words or restarts.",
          },
        },
        required: [
          "time_to_point_seconds",
          "filler_word_count",
          "repetition_count",
          "avg_sentence_length",
          "vague_term_count",
          "restart_count",
          "stutter_count",
        ],
      },
    },
    required: [
      "main_point_summary",
      "structure_detected",
      "structure_suggested",
      "strongest_skill",
      "biggest_weakness",
      "weakness_type",
      "metrics",
    ],
  },
} as const;

interface RawAnalysis extends Omit<SpeechAnalysis, "metrics"> {
  metrics: Omit<SpeechAnalysis["metrics"], "speaking_pace_wpm">;
}

export async function analyzeSpeech(
  transcript: string,
  durationSeconds: number
): Promise<SpeechAnalysis> {
  const client = getOpenAIClient();
  const wordCount = transcript.trim().split(/\s+/).filter(Boolean).length;

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Prompt duration: ${durationSeconds} seconds. Word count: ${wordCount}.\n\nTranscript:\n"""\n${transcript}\n"""`,
      },
    ],
    response_format: { type: "json_schema", json_schema: JSON_SCHEMA },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("The analysis response was empty.");
  }

  const raw = JSON.parse(content) as RawAnalysis;

  const speaking_pace_wpm =
    durationSeconds > 0 ? Math.round((wordCount / durationSeconds) * 60) : null;

  return {
    ...raw,
    metrics: {
      ...raw.metrics,
      speaking_pace_wpm,
    },
  };
}
