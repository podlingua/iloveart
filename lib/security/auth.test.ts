import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const getUserMock = vi.fn();

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: { getUser: getUserMock },
  }),
}));

vi.mock("@/lib/supabase/config", () => ({
  isSupabaseConfigured: true,
  supabaseUrl: "https://example.supabase.co",
  supabaseAnonKey: "test-anon-key",
}));

function requestWithAuth(header: string | null): NextRequest {
  const headers = new Headers();
  if (header) headers.set("authorization", header);
  return new NextRequest("https://api.example.com/api/analyze", { headers });
}

describe("verifyBearerToken", () => {
  beforeEach(() => {
    getUserMock.mockReset();
  });

  it("rejects a request with no Authorization header (missing token)", async () => {
    const { verifyBearerToken } = await import("@/lib/security/auth");
    const result = await verifyBearerToken(requestWithAuth(null));
    expect(result).toBeNull();
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("rejects a header that isn't a Bearer token", async () => {
    const { verifyBearerToken } = await import("@/lib/security/auth");
    const result = await verifyBearerToken(requestWithAuth("Basic sometoken"));
    expect(result).toBeNull();
  });

  it("rejects an invalid token (Supabase returns an error)", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "invalid JWT" },
    });
    const { verifyBearerToken } = await import("@/lib/security/auth");
    const result = await verifyBearerToken(requestWithAuth("Bearer not-a-real-token"));
    expect(result).toBeNull();
  });

  it("rejects an expired token (Supabase returns an expiry error)", async () => {
    getUserMock.mockResolvedValue({
      data: { user: null },
      error: { message: "JWT expired" },
    });
    const { verifyBearerToken } = await import("@/lib/security/auth");
    const result = await verifyBearerToken(requestWithAuth("Bearer expired-token"));
    expect(result).toBeNull();
  });

  it("accepts a valid token and returns only the verified user id", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-123", email: "test@example.com" } },
      error: null,
    });
    const { verifyBearerToken } = await import("@/lib/security/auth");
    const result = await verifyBearerToken(requestWithAuth("Bearer valid-token"));
    expect(result).toEqual({ id: "user-123" });
    expect(getUserMock).toHaveBeenCalledWith("valid-token");
  });
});
