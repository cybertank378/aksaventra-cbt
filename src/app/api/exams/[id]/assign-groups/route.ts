import type { NextRequest } from "next/server";
import { examController } from "../../_factory";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await examController.assignGroups(id, request);
}
