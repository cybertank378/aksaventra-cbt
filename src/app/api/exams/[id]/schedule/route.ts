import type { NextRequest } from "next/server";
import { examController } from "../../_factory";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await examController.updateSchedule(id, request);
}
