import type { ApiResponse } from "@/core/types/ApiResponse";

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  headers?: Record<string, string>;
  body?: unknown;
  timeoutMs?: number;
  signal?: AbortSignal;
}

/**
 * Standard typed HTTP client for Aksaventra CBT client-side requests.
 * Automatically serializes JSON bodies, handles timeout, and normalizes errors into ApiResponse<T>.
 */
export async function apiRequest<T>(
  url: string,
  options: ApiRequestOptions = {},
): Promise<ApiResponse<T>> {
  const {
    method = "GET",
    headers = {},
    body,
    timeoutMs = 15_000,
    signal: userSignal,
  } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    controller.abort(new Error(`Request timed out after ${timeoutMs}ms`));
  }, timeoutMs);

  // Link user signal if provided
  if (userSignal) {
    userSignal.addEventListener("abort", () => {
      controller.abort(userSignal.reason);
    });
  }

  const finalHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  let payloadBody: string | undefined;
  if (body !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    payloadBody = typeof body === "string" ? body : JSON.stringify(body);
  }

  try {
    const res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: payloadBody,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const text = await res.text();
    let json: unknown;
    try {
      json = text ? JSON.parse(text) : null;
    } catch (_err) {
      json = null;
    }

    if (!res.ok) {
      const errorJson = json as {
        error?: { message?: string; code?: string; details?: unknown };
      } | null;
      return {
        success: false,
        error: {
          code: errorJson?.error?.code || `HTTP_${res.status}`,
          message:
            errorJson?.error?.message || res.statusText || "Request failed",
          details: errorJson?.error?.details || json,
        },
      };
    }

    if (json && typeof json === "object" && "success" in json) {
      return json as ApiResponse<T>;
    }

    return {
      success: true,
      data: json as T,
    };
  } catch (error) {
    clearTimeout(timeoutId);

    const isAbort =
      error instanceof Error &&
      (error.name === "AbortError" || error.message.includes("timed out"));

    return {
      success: false,
      error: {
        code: isAbort ? "REQUEST_TIMEOUT" : "NETWORK_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown network error",
      },
    };
  }
}
