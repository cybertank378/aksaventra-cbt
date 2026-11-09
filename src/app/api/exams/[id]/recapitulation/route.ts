import type { NextRequest } from "next/server";
import { recapitulationController } from "@/modules/recapitulation/infrastructure/RecapitulationController";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await recapitulationController.getRecapitulation(request, id);
}
