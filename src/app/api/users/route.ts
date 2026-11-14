import type { NextRequest } from "next/server";
import { usersController } from "./_factory";

export async function GET(request: NextRequest) {
  return await usersController.listUsers(request);
}
