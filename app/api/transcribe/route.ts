import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024; // 25MB, well above a 2-minute clip

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Server is missing OPENAI_API_KEY." },
      { status: 500 }
    );
  }

  const formData = await req.formData();
  const file = formData.get("audio");

  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "No audio file was provided." },
      { status: 400 }
    );
  }

  if (file.size === 0) {
    return NextResponse.json({ error: "The audio file is empty." }, { status: 400 });
  }

  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "The audio file is too large." }, { status: 400 });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const transcription = await client.audio.transcriptions.create({
      file,
      model: "gpt-4o-mini-transcribe",
    });

    return NextResponse.json({ text: transcription.text });
  } catch (err) {
    console.error("Transcription failed:", err);
    return NextResponse.json(
      { error: "Transcription failed. Please try again." },
      { status: 502 }
    );
  }
}
