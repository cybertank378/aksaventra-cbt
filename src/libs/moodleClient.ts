/**
 * Moodle Web Service Client Utility
 *
 * Implements the standard Moodle REST protocol defined in MOODLE_API.md.
 * Automatically marshals payload to application/x-www-form-urlencoded
 * and inspects Moodle exception / error codes.
 */

function resolveMoodleWsEndpoint(): string {
  if (process.env.MOODLE_WS_ENDPOINT) {
    return process.env.MOODLE_WS_ENDPOINT.endsWith(
      "/webservice/rest/server.php",
    )
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

const DEV_FALLBACK_MOODLE_TOKEN = "dev_moodle_ws_token_unconfigured";

function resolveMoodleToken(): string {
  const configured = process.env.MOODLE_WS_TOKEN?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "MOODLE_WS_TOKEN wajib dikonfigurasi pada lingkungan produksi.",
    );
  }

  return DEV_FALLBACK_MOODLE_TOKEN;
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
  const isBulkPull =
    params.action === "pull_all" || params.action === "pull_questions";
  const timeoutMs = isAuthCheck ? 2500 : isBulkPull ? 25000 : 10000;

  let response: Response;
  try {
    response = await fetch(wsEndpoint, {
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
  } catch (err) {
    const cause =
      err instanceof Error && "cause" in err
        ? (err.cause as { code?: string; message?: string } | undefined)
        : undefined;
    const causeDetail = cause
      ? `${cause.code ? `${cause.code}: ` : ""}${cause.message || String(cause)}`
      : err instanceof Error
        ? err.message
        : String(err);
    throw new Error(`Moodle fetch failed (${wsEndpoint}): ${causeDetail}`);
  }

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
