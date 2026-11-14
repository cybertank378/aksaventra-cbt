import type { NextRequest } from "next/server";
import { classesController } from "./_factory";

export async function GET(): Promise<Response> {
  return await classesController.getAllClasses();
}

export async function POST(request: NextRequest): Promise<Response> {
  return await classesController.createClass(request);
}
