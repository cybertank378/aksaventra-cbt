import { createHash } from "node:crypto";

export interface DeviceMetadata {
  userAgent: string;
  language: string;
  screenWidth: number;
  screenHeight: number;
  colorDepth: number;
  hardwareConcurrency: number;
  platform: string;
  timeZone: string;
}

/**
 * Gathers device and browser telemetry from client window environment.
 */
export function collectDeviceMetadata(): DeviceMetadata {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return {
      userAgent: "SSR_SERVER_RUNTIME",
      language: "en-US",
      screenWidth: 1920,
      screenHeight: 1080,
      colorDepth: 24,
      hardwareConcurrency: 4,
      platform: "Server",
      timeZone: "UTC",
    };
  }

  const screen = window.screen;
  return {
    userAgent: navigator.userAgent || "",
    language: navigator.language || "en",
    screenWidth: screen?.width || 0,
    screenHeight: screen?.height || 0,
    colorDepth: screen?.colorDepth || 24,
    hardwareConcurrency: navigator.hardwareConcurrency || 2,
    platform: navigator.platform || "Unknown",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  };
}

/**
 * Computes a deterministic SHA-256 device fingerprint.
 * Safe to execute on both Client (Browser) and Server (Node/Edge).
 */
export async function generateDeviceFingerprint(
  customMetadata?: Partial<DeviceMetadata>,
): Promise<string> {
  const meta = { ...collectDeviceMetadata(), ...customMetadata };
  const rawString = [
    meta.userAgent,
    meta.language,
    meta.screenWidth,
    meta.screenHeight,
    meta.colorDepth,
    meta.hardwareConcurrency,
    meta.platform,
    meta.timeZone,
  ].join(":::");

  // If running in browser with Web Crypto API
  if (
    typeof window !== "undefined" &&
    window.crypto &&
    window.crypto.subtle &&
    typeof TextEncoder !== "undefined"
  ) {
    const encoder = new TextEncoder();
    const data = encoder.encode(rawString);
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  // Fallback to Node.js crypto
  return createHash("sha256").update(rawString).digest("hex");
}

/**
 * Server-side helper to compute or verify device hash matching Moodle mod_cbt device_hash.
 */
export function computeServerDeviceHash(
  userAgent: string,
  ipAddress = "",
  clientFingerprint = "",
): string {
  const combined = `${userAgent.trim()}###${ipAddress.trim()}###${clientFingerprint.trim()}`;
  return createHash("sha256").update(combined).digest("hex");
}
