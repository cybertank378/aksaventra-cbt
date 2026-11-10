/**
 * Moodle Web Service Client Utility
 *
 * Implements the standard Moodle REST protocol defined in MOODLE_API.md.
 * Automatically marshals payload to application/x-www-form-urlencoded
 * and inspects Moodle exception / error codes.
 */

const MOODLE_URL =
  process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";
const MOODLE_TOKEN =
  process.env.MOODLE_WS_TOKEN ||
  "f0e4cae818c6e58419f2f11865010d2b050762e45664b9cc";
const WS_ENDPOINT = `${MOODLE_URL}/webservice/rest/server.php`;

export interface MoodleApiError {
  exception?: string;
  errorcode?: string;
  message?: string;
  debuginfo?: string;
}

export async function callMoodleApi<T = unknown>(
  wsfunction: string,
  params: Record<string, unknown> = {},
  customToken?: string,
): Promise<T> {
  const token = customToken || MOODLE_TOKEN;

  const formData = new URLSearchParams();
  formData.append("wstoken", token);
  formData.append("wsfunction", wsfunction);
  formData.append("moodlewsrestformat", "json");

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      formData.append(
        key,
        typeof value === "object" ? JSON.stringify(value) : String(value),
      );
    }
  }

  const response = await fetch(WS_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData.toString(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = (await response.json()) as T & MoodleApiError;

  // Handle Moodle Web Service Exceptions
  if (json && typeof json === "object") {
    if (json.exception || json.errorcode) {
      throw new Error(
        json.message || `Moodle Exception: ${json.errorcode || json.exception}`,
      );
    }
  }

  return json as T;
}

