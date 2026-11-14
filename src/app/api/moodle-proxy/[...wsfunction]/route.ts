import { type NextRequest, NextResponse } from "next/server";

interface RouteContext {
  params: Promise<{
    wsfunction: string[];
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  return handleMoodleProxy(request, context);
}

export async function POST(request: NextRequest, context: RouteContext) {
  return handleMoodleProxy(request, context);
}

async function handleMoodleProxy(
  request: NextRequest,
  context: RouteContext,
): Promise<NextResponse> {
  const { wsfunction } = await context.params;
  const functionName = wsfunction.join("_");

  const moodleBaseUrl = process.env.MOODLE_WS_ENDPOINT
    ? process.env.MOODLE_WS_ENDPOINT.replace(
        /\/webservice\/rest\/server\.php$/,
        "",
      )
    : process.env.NEXT_PUBLIC_MOODLE_URL || "http://127.0.0.1:8080";
  const moodleToken =
    process.env.MOODLE_WS_TOKEN ||
    "f0e4cae818c6e58419f2f11865010d2b050762e45664b9cc";

  if (!moodleToken) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MOODLE_CONFIG_ERROR",
          message: "MOODLE_WS_TOKEN belum dikonfigurasi pada server Next.js",
        },
      },
      { status: 500 },
    );
  }

  // Construct Moodle REST URL
  const targetUrl = new URL(`${moodleBaseUrl}/webservice/rest/server.php`);
  targetUrl.searchParams.set("wstoken", moodleToken);
  targetUrl.searchParams.set("wsfunction", functionName);
  targetUrl.searchParams.set("moodlewsrestformat", "json");

  // Append client query params
  request.nextUrl.searchParams.forEach((val, key) => {
    targetUrl.searchParams.set(key, val);
  });

  try {
    let bodyData: BodyInit | undefined;
    const contentType = request.headers.get("content-type") || "";
    const headers: Record<string, string> = {
      Accept: "application/json",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      if (contentType.includes("application/json")) {
        const jsonBody = (await request.json()) as Record<string, unknown>;
        const formParams = new URLSearchParams();
        for (const [key, val] of Object.entries(jsonBody)) {
          if (val !== undefined && val !== null) {
            formParams.set(
              key,
              typeof val === "object" ? JSON.stringify(val) : String(val),
            );
          }
        }
        bodyData = formParams.toString();
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        bodyData = await request.text();
        headers["Content-Type"] = "application/x-www-form-urlencoded";
      } else {
        bodyData = await request.text();
        if (contentType) {
          headers["Content-Type"] = contentType;
        }
      }
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers,
      body: bodyData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "MOODLE_PROXY_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Gagal menghubungi server Moodle",
        },
      },
      { status: 502 },
    );
  }
}
