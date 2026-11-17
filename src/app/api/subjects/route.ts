import type { NextRequest } from "next/server";
import { subjectsController } from "./_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await subjectsController.getSubjects(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await subjectsController.createSubject(request);
}
