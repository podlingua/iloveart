import { NextRequest, NextResponse } from "next/server";
import { extractSource } from "@/lib/openai/extractSource";
import { guardRequest, handlePreflight } from "@/lib/security/guard";
import { RATE_LIMITS } from "@/lib/security/rateLimit";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif", "application/pdf"];

export async function OPTIONS(req: NextRequest) {
  return handlePreflight(req);
}

export async function POST(req: NextRequest) {
  const guard = await guardRequest(req, { rateLimit: RATE_LIMITS.extractSource });
  if (guard instanceof NextResponse) return guard;
  const { headers } = guard;

  const formData = await req.formData();
  const file = formData.get("file");
  const lang = formData.get("lang") === "es" ? "es" : "en";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file was provided." }, { status: 400, headers });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: "The file is empty." }, { status: 400, headers });
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: "The file is too large (max 15MB)." }, { status: 400, headers });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Please upload an image (PNG, JPEG, WebP, GIF) or a PDF." },
      { status: 400, headers }
    );
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const dataUrl = `data:${file.type};base64,${bytes.toString("base64")}`;

  try {
    const source = await extractSource(dataUrl, file.type, file.name, lang);
    return NextResponse.json({ source }, { headers });
  } catch (err) {
    console.error("Source extraction failed:", err);
    const message =
      err instanceof Error ? err.message : "Could not read the file. Please try again.";
    return NextResponse.json({ error: message }, { status: 502, headers });
  }
}
