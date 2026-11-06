import type { NextRequest } from "next/server";
import { attemptController } from "./_factory";

export async function POST(req: NextRequest) {
  return attemptController.startAttempt(req);
}
