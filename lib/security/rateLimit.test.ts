import { describe, expect, it } from "vitest";
import { getRateLimiter } from "@/lib/security/rateLimit";

describe("rate limiter", () => {
  it("allows requests under the limit and blocks once the limit is exceeded", async () => {
    const limiter = getRateLimiter();
    const key = `test-user-${Math.random()}`;
    const limit = 3;
    const windowMs = 60_000;

    const first = await limiter.check(key, limit, windowMs);
    const second = await limiter.check(key, limit, windowMs);
    const third = await limiter.check(key, limit, windowMs);
    const fourth = await limiter.check(key, limit, windowMs);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(true);
    expect(third.allowed).toBe(true);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
  });

  it("tracks separate keys (users) independently", async () => {
    const limiter = getRateLimiter();
    const limit = 1;
    const windowMs = 60_000;
    const userA = `user-a-${Math.random()}`;
    const userB = `user-b-${Math.random()}`;

    const aFirst = await limiter.check(userA, limit, windowMs);
    const aSecond = await limiter.check(userA, limit, windowMs);
    const bFirst = await limiter.check(userB, limit, windowMs);

    expect(aFirst.allowed).toBe(true);
    expect(aSecond.allowed).toBe(false);
    expect(bFirst.allowed).toBe(true); // a different user is unaffected by userA's limit
  });
});
