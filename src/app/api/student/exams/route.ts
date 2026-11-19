import type { NextRequest } from "next/server";
import { examController } from "../../exams/_factory";

export async function GET(request: NextRequest) {
  return await examController.listStudentExams(request);
}
