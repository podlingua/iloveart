import { NextRequest, NextResponse } from "next/server";
import { factCheckTranscript } from "@/lib/openai/factCheck";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const transcript = body?.transcript;
  const lang = body?.lang === "es" ? "es" : "en";

  if (typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json({ error: "A transcript is required." }, { status: 400 });
  }

  try {
    const factCheck = await factCheckTranscript(transcript, lang);
    return NextResponse.json({ factCheck });
  } catch (err) {
    console.error("Fact-check failed:", err);
    const message = err instanceof Error ? err.message : "Fact-check failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
