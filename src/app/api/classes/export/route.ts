import type { NextRequest } from "next/server";
import { classesController } from "../_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await classesController.exportClassesCsv(request);
}
