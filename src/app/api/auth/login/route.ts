import type { NextRequest } from "next/server";
import { authController } from "../_factory";

export async function POST(request: NextRequest) {
  return await authController.login(request);
}
