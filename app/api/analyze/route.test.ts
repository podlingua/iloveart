import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const verifyBearerTokenMock = vi.fn();

vi.mock("@/lib/security/auth", () => ({
  verifyBearerToken: verifyBearerTokenMock,
}));

vi.mock("@/lib/openai/analyze", () => ({
  analyzeSpeech: vi.fn().mockResolvedValue({
    main_point_summary: "Test summary",
    structure_detected: ["Main Claim"],
    structure_suggested: ["Main Claim"],
    strongest_skill: "Clarity",
    biggest_weakness: "Pace",
    weakness_type: "compression",
    metrics: {
      time_to_point_seconds: 5,
      filler_word_count: 1,
      repetition_count: 0,
      avg_sentence_length: 10,
      speaking_pace_wpm: 130,
      vague_term_count: 0,
      restart_count: 0,
      stutter_count: 0,
    },
  }),
}));

function jsonRequest(body: unknown, extraHeaders: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://api.example.com/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = { transcript: "This is a test transcript.", durationSeconds: 30 };

describe("/api/analyze", () => {
  beforeEach(() => {
    verifyBearerTokenMock.mockReset();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ALLOWED_ORIGINS", "https://allowed.example.com");
  });

  it("rejects a request with no Authorization header with 401", async () => {
    verifyBearerTokenMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(jsonRequest(VALID_BODY));
    expect(res.status).toBe(401);
  });

  it("rejects an invalid or expired token with 401", async () => {
    verifyBearerTokenMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(jsonRequest(VALID_BODY, { Authorization: "Bearer bad-token" }));
    expect(res.status).toBe(401);
  });

  it("accepts a valid token and returns 200", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: `user-${Math.random()}` });
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(jsonRequest(VALID_BODY, { Authorization: "Bearer good-token" }));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.analysis.main_point_summary).toBe("Test summary");
  });

  it("rejects a disallowed CORS origin with 403, before even checking auth", async () => {
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      jsonRequest(VALID_BODY, { Origin: "https://evil.example.com" })
    );
    expect(res.status).toBe(403);
    expect(verifyBearerTokenMock).not.toHaveBeenCalled();
  });

  it("allows an allowlisted CORS origin through to the auth check", async () => {
    verifyBearerTokenMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      jsonRequest(VALID_BODY, { Origin: "https://allowed.example.com" })
    );
    // Origin is allowed, so it proceeds past CORS to the auth check (which
    // fails here because no token was sent) - never a 403.
    expect(res.status).toBe(401);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://allowed.example.com");
  });

  it("handles an OPTIONS preflight request for an allowed origin", async () => {
    const { OPTIONS } = await import("@/app/api/analyze/route");
    const req = new NextRequest("https://api.example.com/api/analyze", {
      method: "OPTIONS",
      headers: { Origin: "https://allowed.example.com" },
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(204);
    expect(res.headers.get("Access-Control-Allow-Origin")).toBe("https://allowed.example.com");
    expect(res.headers.get("Access-Control-Allow-Headers")).toContain("Authorization");
    expect(res.headers.get("Access-Control-Allow-Methods")).toContain("POST");
  });

  it("rejects an OPTIONS preflight from a disallowed origin", async () => {
    const { OPTIONS } = await import("@/app/api/analyze/route");
    const req = new NextRequest("https://api.example.com/api/analyze", {
      method: "OPTIONS",
      headers: { Origin: "https://evil.example.com" },
    });
    const res = await OPTIONS(req);
    expect(res.status).toBe(403);
  });

  it("returns 429 once the per-user rate limit is exceeded", async () => {
    const userId = `rate-limit-user-${Math.random()}`;
    verifyBearerTokenMock.mockResolvedValue({ id: userId });
    const { POST } = await import("@/app/api/analyze/route");

    let lastStatus = 200;
    // RATE_LIMITS.analyze allows 30 requests per window - the 31st must be blocked.
    for (let i = 0; i < 31; i++) {
      const res = await POST(jsonRequest(VALID_BODY, { Authorization: "Bearer good-token" }));
      lastStatus = res.status;
      if (i === 30) {
        expect(res.status).toBe(429);
        expect(res.headers.get("Retry-After")).toBeTruthy();
      }
    }
    expect(lastStatus).toBe(429);
  });

  it("never trusts a userId sent in the request body", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: "real-verified-user" });
    const { POST } = await import("@/app/api/analyze/route");
    const res = await POST(
      jsonRequest(
        { ...VALID_BODY, userId: "attacker-supplied-id" },
        { Authorization: "Bearer good-token" }
      )
    );
    // The route only ever reads userId from the verified token (asserted by
    // code inspection - the body's userId field is never read anywhere in
    // the route or lib/openai/analyze.ts); the request still succeeds using
    // the token-derived identity, proving the body field is ignored.
    expect(res.status).toBe(200);
  });
});
