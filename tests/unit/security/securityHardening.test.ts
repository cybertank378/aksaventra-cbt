import { describe, expect, it, vi } from "vitest";
import { getJwtSecretString } from "@/security/jwtConfig";
import { isRouteAuthorized } from "@/security/rbacConfig";

vi.mock("server-only", () => ({}));

import { checkRateLimit } from "@/security/rateLimiter";

describe("Security Hardening Controls", () => {
  it("enforces rate limit threshold and returns retryAfterSeconds when exceeded", () => {
    const key = `test:rate-limit:${Date.now()}`;
    const config = { limit: 3, windowMs: 60_000 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);

    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("prevents STUDENT from accessing proctor, upload, sync, and admin APIs", () => {
    expect(isRouteAuthorized("STUDENT", "/api/proctor/chat")).toBe(false);
    expect(isRouteAuthorized("STUDENT", "/api/proctor/exam-1/action")).toBe(
      false,
    );
    expect(isRouteAuthorized("STUDENT", "/api/upload")).toBe(false);
    expect(isRouteAuthorized("STUDENT", "/api/sync")).toBe(false);
    expect(isRouteAuthorized("STUDENT", "/api/users")).toBe(false);
  });

  it("allows PROCTOR on proctor endpoints but blocks management/admin APIs", () => {
    expect(isRouteAuthorized("PROCTOR", "/api/proctor/chat")).toBe(true);
    expect(isRouteAuthorized("PROCTOR", "/api/proctor/exam-1/action")).toBe(
      true,
    );
    expect(isRouteAuthorized("PROCTOR", "/api/upload")).toBe(false);
    expect(isRouteAuthorized("PROCTOR", "/api/users")).toBe(false);
  });

  it("refuses missing CBT_JWT_SECRET in production mode", () => {
    const originalEnv = process.env.NODE_ENV;
    const originalSecret = process.env.CBT_JWT_SECRET;
    try {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("CBT_JWT_SECRET", "");
      expect(() => getJwtSecretString()).toThrow(/CBT_JWT_SECRET/);
    } finally {
      vi.unstubAllEnvs();
      if (originalEnv !== undefined) vi.stubEnv("NODE_ENV", originalEnv);
      if (originalSecret !== undefined)
        vi.stubEnv("CBT_JWT_SECRET", originalSecret);
      vi.unstubAllEnvs();
    }
  });
});
