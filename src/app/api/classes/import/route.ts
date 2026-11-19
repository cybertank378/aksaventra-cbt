import type { NextRequest } from "next/server";
import { classesController } from "../_factory";

export async function POST(request: NextRequest) {
  return await classesController.batchImportClasses(request);
}
