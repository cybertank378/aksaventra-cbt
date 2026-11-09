import type { NextRequest } from "next/server";
import { questionsController } from "../_factory";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await questionsController.getQuestionById(id);
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await questionsController.deleteQuestion(id);
}

