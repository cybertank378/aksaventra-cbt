import type { NextRequest } from "next/server";
import { examController } from "../../_factory";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await examController.getRoster(id, request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await examController.updateSeat(request);
}
