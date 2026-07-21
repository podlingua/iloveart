import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

const verifyBearerTokenMock = vi.fn();
const deleteUserMock = vi.fn().mockResolvedValue({ error: null });

function makeQueryBuilder() {
  const builder: Record<string, unknown> = {};
  builder.select = vi.fn(() => builder);
  builder.delete = vi.fn(() => builder);
  builder.eq = vi.fn(() => Promise.resolve({ data: [], error: null }));
  builder.in = vi.fn(() => Promise.resolve({ data: [], error: null }));
  return builder;
}

vi.mock("@/lib/security/auth", () => ({
  verifyBearerToken: verifyBearerTokenMock,
}));

vi.mock("@/lib/supabase/admin", () => ({
  getSupabaseAdminClient: () => ({
    from: () => makeQueryBuilder(),
    storage: {
      from: () => ({
        list: vi.fn().mockResolvedValue({ data: [], error: null }),
        remove: vi.fn().mockResolvedValue({ data: [], error: null }),
      }),
    },
    auth: { admin: { deleteUser: deleteUserMock } },
  }),
}));

function deleteRequest(body: unknown, extraHeaders: Record<string, string> = {}): NextRequest {
  return new NextRequest("https://api.example.com/api/delete-account", {
    method: "POST",
    headers: { "Content-Type": "application/json", ...extraHeaders },
    body: JSON.stringify(body),
  });
}

describe("/api/delete-account", () => {
  beforeEach(() => {
    verifyBearerTokenMock.mockReset();
    deleteUserMock.mockClear();
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ALLOWED_ORIGINS", "");
  });

  it("rejects a request with no token with 401, before checking confirmation", async () => {
    verifyBearerTokenMock.mockResolvedValue(null);
    const { POST } = await import("@/app/api/delete-account/route");
    const res = await POST(deleteRequest({ confirm: "DELETE" }));
    expect(res.status).toBe(401);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("rejects a valid token without the confirmation value", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/delete-account/route");
    const res = await POST(
      deleteRequest({}, { Authorization: "Bearer good-token" })
    );
    expect(res.status).toBe(400);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("rejects an incorrect confirmation value", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/delete-account/route");
    const res = await POST(
      deleteRequest({ confirm: "yes please" }, { Authorization: "Bearer good-token" })
    );
    expect(res.status).toBe(400);
    expect(deleteUserMock).not.toHaveBeenCalled();
  });

  it("proceeds with deletion given a valid token and the exact confirmation value", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: "user-1" });
    const { POST } = await import("@/app/api/delete-account/route");
    const res = await POST(
      deleteRequest({ confirm: "DELETE" }, { Authorization: "Bearer good-token" })
    );
    expect(res.status).toBe(200);
    expect(deleteUserMock).toHaveBeenCalledWith("user-1");
  });

  it("derives the deleted user id only from the verified token, never the body", async () => {
    verifyBearerTokenMock.mockResolvedValue({ id: "real-verified-user" });
    const { POST } = await import("@/app/api/delete-account/route");
    await POST(
      deleteRequest(
        { confirm: "DELETE", userId: "attacker-supplied-id" },
        { Authorization: "Bearer good-token" }
      )
    );
    expect(deleteUserMock).toHaveBeenCalledWith("real-verified-user");
    expect(deleteUserMock).not.toHaveBeenCalledWith("attacker-supplied-id");
  });
});
