import type { NextRequest } from "next/server";
import { attemptController } from "../../_factory";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return await attemptController.submitAttempt(request, id);
}

