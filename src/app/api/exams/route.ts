import type { NextRequest } from "next/server";
import { examController } from "./_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await examController.listExams(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await examController.createExam(request);
}
