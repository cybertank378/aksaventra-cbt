import type { NextRequest } from "next/server";
import { proctorController } from "../_factory";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ examId: string }> },
) {
  const { examId } = await context.params;
  return await proctorController.executeAction(request, examId);
}
