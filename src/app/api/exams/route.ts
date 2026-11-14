import type { NextRequest } from "next/server";
import { examController } from "./_factory";

export async function GET() {
  return await examController.listExams();
}

export async function POST(request: NextRequest) {
  return await examController.createExam(request);
}
