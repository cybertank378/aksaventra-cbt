import type { NextRequest } from "next/server";
import { classesController } from "../classes/_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await classesController.getAllStudents(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await classesController.createStudent(request);
}
