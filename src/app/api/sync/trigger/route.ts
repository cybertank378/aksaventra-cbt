import type { NextRequest } from "next/server";
import { syncController } from "../_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await syncController.getStatus(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await syncController.triggerSync(request);
}
