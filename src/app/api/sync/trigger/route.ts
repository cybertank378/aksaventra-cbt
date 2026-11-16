import type { NextRequest } from "next/server";
import { syncController } from "../_factory";

export async function GET(): Promise<Response> {
  return await syncController.getStatus();
}

export async function POST(request: NextRequest): Promise<Response> {
  return await syncController.triggerSync(request);
}
