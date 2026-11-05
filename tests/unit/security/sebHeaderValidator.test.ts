import { describe, expect, it } from "vitest";
import {
  computeSebHash,
  isSebUserAgent,
  safeCompareHash,
  validateSebHeaders,
} from "@/security/sebHeaderValidator";

describe("sebHeaderValidator", () => {
  const requestUrl = "https://cbt.aksaventra.ac.id/student/exam/attempt-123";
  const browserExamKey = "bek-secret-key-12345";
  const configKey = "config-key-secret-abcde";

  it("computes correct SHA-256 hash for URL and key combination", () => {
    const hash = computeSebHash(requestUrl, browserExamKey);
    expect(hash).toHaveLength(64); // 32 bytes in hex = 64 characters
    expect(typeof hash).toBe("string");
  });

  it("validates authentic SEB Request Hash and Config Key Hash", () => {
    const requestHash = computeSebHash(requestUrl, browserExamKey);
    const configKeyHash = computeSebHash(requestUrl, configKey);

    const result = validateSebHeaders({
      requestUrl,
      requestHashHeader: requestHash,
      configKeyHashHeader: configKeyHash,
      expectedBrowserExamKey: browserExamKey,
      expectedConfigKey: configKey,
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) SEB/3.4.1",
      requireSebUserAgent: true,
    });

    expect(result.isValid).toBe(true);
    expect(result.browserExamKeyValid).toBe(true);
    expect(result.configKeyValid).toBe(true);
    expect(result.userAgentValid).toBe(true);
  });

  it("rejects spoofed or non-SEB User-Agent when requireSebUserAgent is true", () => {
    const requestHash = computeSebHash(requestUrl, browserExamKey);

    const result = validateSebHeaders({
      requestUrl,
      requestHashHeader: requestHash,
      expectedBrowserExamKey: browserExamKey,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
      requireSebUserAgent: true,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain(
      "User-Agent does not identify as Safe Exam Browser",
    );
    expect(result.userAgentValid).toBe(false);
  });

  it("rejects invalid or tampered Request Hash signature", () => {
    const fakeHash =
      "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";

    const result = validateSebHeaders({
      requestUrl,
      requestHashHeader: fakeHash,
      expectedBrowserExamKey: browserExamKey,
      userAgent: "SEB/3.2.0",
      requireSebUserAgent: true,
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain(
      "Invalid X-SafeExamBrowser-RequestHash cryptographic signature",
    );
    expect(result.browserExamKeyValid).toBe(false);
  });

  it("rejects missing headers when expected keys are configured", () => {
    const result = validateSebHeaders({
      requestUrl,
      expectedBrowserExamKey: browserExamKey,
      userAgent: "SEB/3.0.0",
    });

    expect(result.isValid).toBe(false);
    expect(result.reason).toContain(
      "Missing X-SafeExamBrowser-RequestHash header",
    );
  });

  it("safeCompareHash handles malformed or non-matching byte lengths safely without throwing", () => {
    expect(safeCompareHash("", "abcdef")).toBe(false);
    expect(safeCompareHash("short", "short")).toBe(false); // not 32 bytes
    expect(safeCompareHash("not-a-hex-string", "not-a-hex-string")).toBe(false);
  });

  it("isSebUserAgent detects SEB versions accurately", () => {
    expect(isSebUserAgent("Mozilla/5.0 SEB/3.4.1 (Windows)")).toBe(true);
    expect(isSebUserAgent("SafeExamBrowser/2.4.0 (macOS)")).toBe(true);
    expect(isSebUserAgent("Mozilla/5.0 Chrome/120.0.0.0 Safari/537.36")).toBe(
      false,
    );
    expect(isSebUserAgent("")).toBe(false);
    expect(isSebUserAgent(null)).toBe(false);
  });
});
