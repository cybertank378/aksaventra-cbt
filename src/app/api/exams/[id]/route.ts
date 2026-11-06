import type { NextRequest } from "next/server";
import { examController } from "../_factory";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return await examController.getById(id);
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  return await examController.updateExam(id, request);
}
