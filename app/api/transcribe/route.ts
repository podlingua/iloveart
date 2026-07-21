import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { guardRequest, handlePreflight } from "@/lib/security/guard";
import { RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB, well above a 2-minute clip

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  const guard = await guardRequest(req, { rateLimit: RATE_LIMITS.transcribe });
  if (guard instanceof NextResponse) return guard;
  const { headers } = guard;

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY." },
      { status: 500, headers }
    );
  }

  const formData = await req.formData();
  const file = formData.get("audio");
  const lang = formData.get("lang") === "es" ? "es" : "en";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No audio file was provided." }, { status: 400, headers });
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The audio file is empty." }, { status: 400, headers });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "The audio file is too large." }, { status: 400, headers });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
      language: lang,
    });

    return NextResponse.json({ text: transcription.text }, { headers });
  } catch (err) {
    console.error("Transcription failed:", err);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 502, headers }
    );
  }
}
