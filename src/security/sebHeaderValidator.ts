import { createHash, timingSafeEqual } from "node:crypto";

export interface SebValidationOptions {
  requestUrl: string;
  requestHashHeader?: string | null;
  configKeyHashHeader?: string | null;
  expectedBrowserExamKey?: string;
  expectedConfigKey?: string;
  userAgent?: string | null;
  requireSebUserAgent?: boolean;
}

export interface SebValidationResult {
  isValid: boolean;
  reason?: string;
  browserExamKeyValid?: boolean;
  configKeyValid?: boolean;
  userAgentValid?: boolean;
}

/**
 * Computes SEB SHA-256 hash: SHA256(URL + Key)
 */
export function computeSebHash(url: string, key: string): string {
  return createHash("sha256").update(`${url}${key}`).digest("hex");
}

/**
 * Safely compares two hex hash strings using timingSafeEqual to prevent timing attacks.
 */
export function safeCompareHash(
  receivedHash: string,
  expectedHash: string,
): boolean {
  if (!receivedHash || !expectedHash) return false;

  const cleanReceived = receivedHash.trim().toLowerCase();
  const cleanExpected = expectedHash.trim().toLowerCase();

  const bufReceived = Buffer.from(cleanReceived, "hex");
  const bufExpected = Buffer.from(cleanExpected, "hex");

  // Both SHA-256 hex hashes must be 32 bytes (64 hex characters)
  if (bufReceived.length !== 32 || bufExpected.length !== 32) {
    return false;
  }

  return timingSafeEqual(bufReceived, bufExpected);
}

/**
 * Checks if User-Agent contains Safe Exam Browser signature.
 */
export function isSebUserAgent(userAgent?: string | null): boolean {
  if (!userAgent) return false;
  return /SEB\b|SafeExamBrowser/i.test(userAgent);
}

/**
 * Validates incoming Safe Exam Browser cryptographic request headers and User-Agent.
 */
export function validateSebHeaders(
  options: SebValidationOptions,
): SebValidationResult {
  const {
    requestUrl,
    requestHashHeader,
    configKeyHashHeader,
    expectedBrowserExamKey,
    expectedConfigKey,
    userAgent,
    requireSebUserAgent = true,
  } = options;

  // 1. Verify User-Agent if required
  let userAgentValid = true;
  if (requireSebUserAgent) {
    userAgentValid = isSebUserAgent(userAgent);
    if (!userAgentValid) {
      return {
        isValid: false,
        reason: "User-Agent does not identify as Safe Exam Browser",
        userAgentValid: false,
      };
    }
  }

  // 2. Validate Browser Exam Key (BEK) Request Hash if expected
  let bekValid = false;
  if (expectedBrowserExamKey) {
    if (!requestHashHeader) {
      return {
        isValid: false,
        reason: "Missing X-SafeExamBrowser-RequestHash header",
        browserExamKeyValid: false,
        userAgentValid,
      };
    }

    const expectedHash = computeSebHash(requestUrl, expectedBrowserExamKey);
    bekValid = safeCompareHash(requestHashHeader, expectedHash);

    if (!bekValid) {
      return {
        isValid: false,
        reason: "Invalid X-SafeExamBrowser-RequestHash cryptographic signature",
        browserExamKeyValid: false,
        userAgentValid,
      };
    }
  }

  // 3. Validate Config Key Hash if expected
  let configKeyValid = false;
  if (expectedConfigKey) {
    if (!configKeyHashHeader) {
      return {
        isValid: false,
        reason: "Missing X-SafeExamBrowser-ConfigKeyHash header",
        configKeyValid: false,
        userAgentValid,
      };
    }

    const expectedConfigHash = computeSebHash(requestUrl, expectedConfigKey);
    configKeyValid = safeCompareHash(configKeyHashHeader, expectedConfigHash);

    if (!configKeyValid) {
      return {
        isValid: false,
        reason:
          "Invalid X-SafeExamBrowser-ConfigKeyHash cryptographic signature",
        configKeyValid: false,
        userAgentValid,
      };
    }
  }

  return {
    isValid: true,
    browserExamKeyValid: expectedBrowserExamKey ? bekValid : undefined,
    configKeyValid: expectedConfigKey ? configKeyValid : undefined,
    userAgentValid,
  };
}
