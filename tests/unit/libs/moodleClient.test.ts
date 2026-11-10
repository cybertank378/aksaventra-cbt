import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { callMoodleApi } from "@/libs/moodleClient";

describe("moodleClient (callMoodleApi)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("sends standard Moodle REST request with application/x-www-form-urlencoded", async () => {
    const mockResponse = {
      success: true,
      data: "test-data",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue(mockResponse),
    } as unknown as Response);

    const result = await callMoodleApi<{ success: boolean; data: string }>(
      "mod_cbt_get_exam_manifest",
      { cbtid: 1, token: "123456" },
    );

    expect(result).toEqual(mockResponse);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const [calledUrl, calledOptions] = (global.fetch as any).mock.calls[0];
    expect(calledUrl).toContain("/webservice/rest/server.php");
    expect(calledOptions.method).toBe("POST");
    expect(calledOptions.headers["Content-Type"]).toBe(
      "application/x-www-form-urlencoded",
    );

    const bodyParams = new URLSearchParams(calledOptions.body);
    expect(bodyParams.get("wsfunction")).toBe("mod_cbt_get_exam_manifest");
    expect(bodyParams.get("moodlewsrestformat")).toBe("json");
    expect(bodyParams.get("cbtid")).toBe("1");
    expect(bodyParams.get("token")).toBe("123456");
  });

  it("throws error when Moodle returns exception or errorcode", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        exception: "moodle_exception",
        errorcode: "invalidtoken",
        message: "Invalid token provided",
      }),
    } as unknown as Response);

    await expect(
      callMoodleApi("mod_cbt_sync_batch_answers", { attemptid: 1 }),
    ).rejects.toThrow("Invalid token provided");
  });

  it("throws error when HTTP status is not ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: vi.fn(),
    } as unknown as Response);

    await expect(
      callMoodleApi("mod_cbt_get_recapitulation", { cbtid: 2 }),
    ).rejects.toThrow("HTTP error! status: 500");
  });
});

