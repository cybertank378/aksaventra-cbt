import type { NextRequest } from "next/server";
import { questionsController } from "../_factory";

export async function POST(request: NextRequest): Promise<Response> {
  return await questionsController.bulkGroupQuestions(request);
}
