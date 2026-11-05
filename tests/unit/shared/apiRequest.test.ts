import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@/core/errors/ApiError";
import { apiRequest } from "@/shared/api/apiRequest";
import { unwrapApiResponse } from "@/shared/api/unwrapApiResponse";

describe("apiRequest & unwrapApiResponse", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("performs GET request and parses response successfully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: async () =>
        JSON.stringify({ success: true, data: { id: 1, name: "CBT Exam" } }),
    } as unknown as Response);

    const res = await apiRequest<{ id: number; name: string }>("/api/test");
    expect(res.success).toBe(true);
    if (res.success) {
      expect(res.data.name).toBe("CBT Exam");
    }
  });

  it("handles HTTP error responses gracefully", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      statusText: "Not Found",
      text: async () =>
        JSON.stringify({
          success: false,
          error: { code: "NOT_FOUND", message: "Attempt not found" },
        }),
    } as unknown as Response);

    const res = await apiRequest("/api/missing");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NOT_FOUND");
      expect(res.error.message).toBe("Attempt not found");
    }
  });

  it("handles network failure or timeout", async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch"));

    const res = await apiRequest("/api/network-down");
    expect(res.success).toBe(false);
    if (!res.success) {
      expect(res.error.code).toBe("NETWORK_ERROR");
      expect(res.error.message).toBe("Failed to fetch");
    }
  });

  it("unwraps successful ApiResponse", () => {
    const response = {
      success: true as const,
      data: { score: 95 },
    };

    const data = unwrapApiResponse(response);
    expect(data.score).toBe(95);
  });

  it("throws ApiError when unwrapping failed ApiResponse", () => {
    const errorResponse = {
      success: false as const,
      error: {
        code: "EXAM_LOCKED",
        message: "Student attempt is locked",
      },
    };

    expect(() => unwrapApiResponse(errorResponse)).toThrow(ApiError);
    expect(() => unwrapApiResponse(errorResponse)).toThrow(
      "Student attempt is locked",
    );
  });
});
