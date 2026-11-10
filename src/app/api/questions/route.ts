import type { NextRequest } from "next/server";
import { questionsController } from "./_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await questionsController.getQuestions(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await questionsController.createQuestion(request);
}
