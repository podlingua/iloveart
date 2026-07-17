import { NextRequest, NextResponse } from "next/server";
import { analyzeSpeech } from "@/lib/openai/analyze";
import { getDrill } from "@/lib/drills/templates";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const transcript = body?.transcript;
  const durationSeconds = body?.durationSeconds;
  const targetStructure =
    typeof body?.targetStructure === "string" ? body.targetStructure : undefined;

  if (typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json({ error: "A transcript is required." }, { status: 400 });
  }
  if (typeof durationSeconds !== "number" || durationSeconds <= 0) {
    return NextResponse.json({ error: "A valid durationSeconds is required." }, { status: 400 });
  }

  try {
    const analysis = await analyzeSpeech(transcript, durationSeconds, targetStructure);
    const drill = getDrill(analysis.weakness_type);
    return NextResponse.json({ analysis, drill });
  } catch (err) {
    console.error("Analysis failed:", err);
    const message = err instanceof Error ? err.message : "Analysis failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
