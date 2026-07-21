import { NextRequest, NextResponse } from "next/server";
import { compareAttempts } from "@/lib/openai/compare";
import { SpeechAnalysis } from "@/lib/types/analysis";
import { guardRequest, handlePreflight } from "@/lib/security/guard";
import { RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  const guard = await guardRequest(req, { rateLimit: RATE_LIMITS.compare });
  if (guard instanceof NextResponse) return guard;
  const { headers } = guard;

  const body = await req.json().catch(() => null);
  const attempt1 = body?.attempt1 as SpeechAnalysis | undefined;
  const attempt2 = body?.attempt2 as SpeechAnalysis | undefined;
  const promptText = body?.promptText;
  const lang = body?.lang === "es" ? "es" : "en";

  if (!attempt1 || !attempt2 || typeof promptText !== "string") {
    return NextResponse.json(
      { error: "attempt1, attempt2, and promptText are required." },
      { status: 400, headers }
    );
  }

  try {
    const comparison = await compareAttempts(attempt1, attempt2, promptText, lang);
    return NextResponse.json({ comparison }, { headers });
  } catch (err) {
    console.error("Comparison failed:", err);
    const message = err instanceof Error ? err.message : "Comparison failed. Please try again.";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}
