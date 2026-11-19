import { classesController } from "../_factory";

export async function GET() {
  return await classesController.exportClassesCsv();
}
