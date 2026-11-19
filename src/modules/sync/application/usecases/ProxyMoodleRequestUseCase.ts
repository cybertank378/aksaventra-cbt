import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";

const ALLOWED_WSFUNCTION_PATTERN = /^mod_cbt_[a-z0-9_]+$/;
const RESERVED_QUERY_PARAMS = new Set([
  "wstoken",
  "wsfunction",
  "moodlewsrestformat",
]);

export interface ProxyMoodleRequestInput {
  wsfunction: string[];
  method: string;
  searchParams: URLSearchParams;
  contentType: string;
  rawBody?: string;
}

export interface ProxyMoodleResponse {
  status: number;
  data: unknown;
}

export class ProxyMoodleRequestUseCase {
  public async execute(
    input: ProxyMoodleRequestInput,
  ): Promise<Result<ProxyMoodleResponse, AppError>> {
    const functionName = input.wsfunction.join("_").trim();

    if (!ALLOWED_WSFUNCTION_PATTERN.test(functionName)) {
      return Result.fail(
        DomainError.forbidden(
          `Fungsi webservice Moodle tidak diizinkan melalui proxy: ${functionName}`,
        ),
      );
    }

    const moodleBaseUrl = process.env.MOODLE_WS_ENDPOINT
      ? process.env.MOODLE_WS_ENDPOINT.replace(
          /\/webservice\/rest\/server\.php$/,
          "",
        )
      : process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";
    const moodleToken = process.env.MOODLE_WS_TOKEN?.trim();

    if (!moodleToken) {
      return Result.fail(
        new DomainError(
          "MOODLE_WS_TOKEN belum dikonfigurasi pada server Next.js",
          500,
          "MOODLE_CONFIG_ERROR",
        ),
      );
    }

    const targetUrl = new URL(`${moodleBaseUrl}/webservice/rest/server.php`);
    targetUrl.searchParams.set("wstoken", moodleToken);
    targetUrl.searchParams.set("wsfunction", functionName);
    targetUrl.searchParams.set("moodlewsrestformat", "json");

    input.searchParams.forEach((val, key) => {
      if (!RESERVED_QUERY_PARAMS.has(key.toLowerCase())) {
        targetUrl.searchParams.set(key, val);
      }
    });

    try {
      let bodyData: BodyInit | undefined;
      const headers: Record<string, string> = {
        Accept: "application/json",
      };

      if (input.method !== "GET" && input.method !== "HEAD" && input.rawBody) {
        if (input.contentType.includes("application/json")) {
          const jsonBody = JSON.parse(input.rawBody) as Record<string, unknown>;
          const formParams = new URLSearchParams();
          for (const [key, val] of Object.entries(jsonBody)) {
            if (
              val !== undefined &&
              val !== null &&
              !RESERVED_QUERY_PARAMS.has(key.toLowerCase())
            ) {
              formParams.set(
                key,
                typeof val === "object" ? JSON.stringify(val) : String(val),
              );
            }
          }
          bodyData = formParams.toString();
          headers["Content-Type"] = "application/x-www-form-urlencoded";
        } else if (
          input.contentType.includes("application/x-www-form-urlencoded")
        ) {
          bodyData = input.rawBody;
          headers["Content-Type"] = "application/x-www-form-urlencoded";
        } else {
          bodyData = input.rawBody;
          if (input.contentType) {
            headers["Content-Type"] = input.contentType;
          }
        }
      }

      const response = await fetch(targetUrl.toString(), {
        method: input.method,
        headers,
        body: bodyData,
      });

      const data = await response.json();
      return Result.ok({
        status: response.status,
        data,
      });
    } catch (error) {
      return Result.fail(
        new DomainError(
          error instanceof Error
            ? error.message
            : "Gagal menghubungi server Moodle",
          502,
          "MOODLE_PROXY_ERROR",
        ),
      );
    }
  }
}
