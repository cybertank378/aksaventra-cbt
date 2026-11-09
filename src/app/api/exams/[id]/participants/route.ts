import type { NextRequest } from "next/server";
import { examController } from "../../_factory";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await examController.getRoster(id);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await examController.updateSeat(request);
}
