import type { NextRequest } from "next/server";
import { syncController } from "../_factory";

export async function POST(request: NextRequest): Promise<Response> {
  return await syncController.handleWebhook(request);
}
