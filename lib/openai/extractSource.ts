import { getOpenAIClient } from "@/lib/openai/client";
import { ExtractedSource } from "@/lib/types/source";

const SYSTEM_PROMPT = `You are reading a file (photo or document) that someone wants to explain out loud as a speaking practice exercise.

1. Write a "topic": a short speaking prompt describing what this is, under 12 words, e.g. "Explain the water cycle" or "Explain what this chart shows about revenue".
2. Write a "summary": a thorough but compact factual summary of the key content, facts, and figures in the file (a few sentences to a short paragraph). This will later be used to check how accurately someone explains it out loud, so include the specific facts, numbers, and claims that matter most.

Respond with ONLY a JSON object (no markdown code fences, no commentary) in exactly this shape:
{"topic": string, "summary": string}`;

function parseJsonLoose(text: string): unknown {
  const trimmed = text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(trimmed);
}

export async function extractSource(
  fileDataUrl: string,
  mimeType: string,
  filename: string,
  lang: "en" | "es" = "en"
): Promise<ExtractedSource> {
  const client = getOpenAIClient();
  const isImage = mimeType.startsWith("image/");

  const languageNote = lang === "es" ? " Write the topic and summary in Spanish." : "";

  const response = await client.responses.create({
    model: "gpt-4o-mini",
    instructions: SYSTEM_PROMPT + languageNote,
    input: [
      {
        role: "user",
        content: [
          { type: "input_text", text: "Read this file and extract the topic and summary." },
          isImage
            ? { type: "input_image", image_url: fileDataUrl, detail: "auto" }
            : { type: "input_file", filename, file_data: fileDataUrl },
        ],
      },
    ],
  });

  const text = response.output_text;
  if (!text) {
    throw new Error("The file could not be read.");
  }

  const parsed = parseJsonLoose(text) as Partial<ExtractedSource>;
  if (!parsed.topic || !parsed.summary) {
    throw new Error("The file could not be understood.");
  }

  return { topic: parsed.topic, summary: parsed.summary };
}
