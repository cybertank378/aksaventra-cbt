import type { NextRequest } from "next/server";
import { examCardsController } from "./_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await examCardsController.getCards(request);
}
