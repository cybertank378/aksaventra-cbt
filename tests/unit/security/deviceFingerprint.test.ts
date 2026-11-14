import { describe, expect, it } from "vitest";
import {
  collectDeviceMetadata,
  computeServerDeviceHash,
  generateDeviceFingerprint,
} from "@/security/deviceFingerprint";

describe("deviceFingerprint (Single-Device Session Binding)", () => {
  it("collects fallback metadata in SSR / Node.js test environment", () => {
    const meta = collectDeviceMetadata();
    expect(meta).toBeDefined();
    expect(meta.screenWidth).toBeGreaterThan(0);
    expect(meta.screenHeight).toBeGreaterThan(0);
    expect(typeof meta.userAgent).toBe("string");
  });

  it("generates a 64-character SHA-256 fingerprint hash", async () => {
    const hash = await generateDeviceFingerprint();
    expect(hash).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("produces deterministic output for identical device telemetry", async () => {
    const customMeta = {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AksaventraSafeBrowser/1.0",
      language: "id-ID",
      screenWidth: 1920,
      screenHeight: 1080,
      colorDepth: 24,
      hardwareConcurrency: 8,
      platform: "Win32",
      timeZone: "Asia/Jakarta",
    };

    const hash1 = await generateDeviceFingerprint(customMeta);
    const hash2 = await generateDeviceFingerprint(customMeta);

    expect(hash1).toBe(hash2);
  });

  it("produces different hash when device characteristics differ", async () => {
    const metaA = {
      userAgent: "Device-A-Chrome",
      screenWidth: 1366,
      screenHeight: 768,
    };

    const metaB = {
      userAgent: "Device-B-Firefox",
      screenWidth: 1920,
      screenHeight: 1080,
    };

    const hashA = await generateDeviceFingerprint(metaA);
    const hashB = await generateDeviceFingerprint(metaB);

    expect(hashA).not.toBe(hashB);
  });

  it("computes server device hash compatible with Moodle device_hash column", () => {
    const serverHash = computeServerDeviceHash(
      "Mozilla/5.0 Windows SEB/3.4",
      "192.168.1.100",
      "client-fp-12345",
    );

    expect(serverHash).toHaveLength(64);
    expect(typeof serverHash).toBe("string");
  });
});
