import { NextRequest, NextResponse } from "next/server";
import { factCheckTranscript } from "@/lib/openai/factCheck";
import { guardRequest, handlePreflight } from "@/lib/security/guard";
import { RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  const guard = await guardRequest(req, { rateLimit: RATE_LIMITS.factCheck });
  if (guard instanceof NextResponse) return guard;
  const { headers } = guard;

  const body = await req.json().catch(() => null);
  const transcript = body?.transcript;
  const lang = body?.lang === "es" ? "es" : "en";

  if (typeof transcript !== "string" || !transcript.trim()) {
    return NextResponse.json({ error: "A transcript is required." }, { status: 400, headers });
  }

  try {
    const factCheck = await factCheckTranscript(transcript, lang);
    return NextResponse.json({ factCheck }, { headers });
  } catch (err) {
    console.error("Fact-check failed:", err);
    const message = err instanceof Error ? err.message : "Fact-check failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}
