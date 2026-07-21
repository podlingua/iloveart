import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { corsHeaders, resolveAllowedOrigin } from "@/lib/security/cors";

describe("resolveAllowedOrigin", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns null when there is no Origin header", () => {
    expect(resolveAllowedOrigin(null)).toBeNull();
  });

  it("allows an origin listed in ALLOWED_ORIGINS in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://my-site.example.com,capacitor://localhost");
    expect(resolveAllowedOrigin("https://my-site.example.com")).toBe(
      "https://my-site.example.com"
    );
    expect(resolveAllowedOrigin("capacitor://localhost")).toBe("capacitor://localhost");
  });

  it("rejects an origin not in the allowlist in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://my-site.example.com");
    expect(resolveAllowedOrigin("https://evil.example.com")).toBeNull();
  });

  it("never allows a wildcard-style match - only exact origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "https://my-site.example.com");
    expect(resolveAllowedOrigin("https://sub.my-site.example.com")).toBeNull();
    expect(resolveAllowedOrigin("http://my-site.example.com")).toBeNull(); // scheme differs
  });

  it("allows common localhost dev origins automatically outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("ALLOWED_ORIGINS", "");
    expect(resolveAllowedOrigin("http://localhost:3000")).toBe("http://localhost:3000");
    expect(resolveAllowedOrigin("capacitor://localhost")).toBe("capacitor://localhost");
    expect(resolveAllowedOrigin("https://localhost")).toBe("https://localhost");
  });

  it("does NOT allow dev-only origins in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("ALLOWED_ORIGINS", "");
    expect(resolveAllowedOrigin("http://localhost:3000")).toBeNull();
  });
});

describe("corsHeaders", () => {
  it("returns no headers when there is no allowed origin", () => {
    expect(corsHeaders(null)).toEqual({});
  });

  it("echoes back the specific allowed origin, never a wildcard", () => {
    const headers = corsHeaders("https://my-site.example.com");
    expect(headers["Access-Control-Allow-Origin"]).toBe("https://my-site.example.com");
    expect(headers["Access-Control-Allow-Origin"]).not.toBe("*");
  });
});
