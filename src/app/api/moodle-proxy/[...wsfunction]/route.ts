import type { NextRequest } from "next/server";
import { syncController } from "../../sync/_factory";

interface RouteContext {
  params: Promise<{
    wsfunction: string[];
  }>;
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { wsfunction } = await context.params;
  return await syncController.proxyMoodleRequest(request, wsfunction);
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { wsfunction } = await context.params;
  return await syncController.proxyMoodleRequest(request, wsfunction);
}
