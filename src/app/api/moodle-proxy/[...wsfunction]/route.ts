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

  const moodleBaseUrl = process.env.MOODLE_URL || "http://localhost:8000";
  const moodleToken = process.env.MOODLE_WS_TOKEN || "";

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

    if (request.method !== "GET" && request.method !== "HEAD") {
      if (contentType.includes("application/json")) {
        bodyData = JSON.stringify(await request.json());
      } else if (contentType.includes("application/x-www-form-urlencoded")) {
        bodyData = await request.text();
      } else {
        bodyData = await request.text();
      }
    }

    const response = await fetch(targetUrl.toString(), {
      method: request.method,
      headers: {
        Accept: "application/json",
        ...(contentType ? { "Content-Type": contentType } : {}),
      },
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
