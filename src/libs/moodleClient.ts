/**
 * Moodle Web Service Client Utility
 *
 * Implements the standard Moodle REST protocol defined in MOODLE_API.md.
 * Automatically marshals payload to application/x-www-form-urlencoded
 * and inspects Moodle exception / error codes.
 */

function resolveMoodleWsEndpoint(): string {
  if (process.env.MOODLE_WS_ENDPOINT) {
    return process.env.MOODLE_WS_ENDPOINT.endsWith("/webservice/rest/server.php")
      ? process.env.MOODLE_WS_ENDPOINT
      : `${process.env.MOODLE_WS_ENDPOINT.replace(/\/+$/, "")}/webservice/rest/server.php`;
  }
  const baseUrl = (
    process.env.MOODLE_INTERNAL_URL ||
    process.env.MOODLE_URL ||
    process.env.NEXT_PUBLIC_MOODLE_URL ||
    "http://127.0.0.1:8080"
  ).replace(/\/+$/, "");
  return `${baseUrl}/webservice/rest/server.php`;
}

function resolveMoodleToken(): string {
  return (
    process.env.MOODLE_WS_TOKEN ||
    "f0e4cae818c6e58419f2f11865010d2b050762e45664b9cc"
  );
}

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
  const token = customToken || resolveMoodleToken();
  const wsEndpoint = resolveMoodleWsEndpoint();

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

  const isAuthCheck = params.action === "verify_user_credentials";
  const timeoutMs = isAuthCheck ? 2500 : 8000;

  const response = await fetch(wsEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "Mozilla/5.0 (compatible; AksaventraCBT/1.0)",
    },
    body: formData.toString(),
    cache: "no-store",
    ...(process.env.NODE_ENV !== "test"
      ? { signal: AbortSignal.timeout(timeoutMs) }
      : {}),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = (await response.json()) as T & MoodleApiError;

  // Handle Moodle Web Service Exceptions
  if (json && typeof json === "object") {
    if (json.exception || json.errorcode) {
      const baseMsg =
        json.message || `Moodle Exception: ${json.errorcode || json.exception}`;
      throw new Error(
        json.debuginfo ? `${baseMsg} (${json.debuginfo})` : baseMsg,
      );
    }
  }

  return json as T;
}
