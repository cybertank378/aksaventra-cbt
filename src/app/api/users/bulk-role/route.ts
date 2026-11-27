import type { NextRequest } from "next/server";
import { usersController } from "../_factory";

export async function PATCH(request: NextRequest): Promise<Response> {
  return await usersController.bulkUpdateRole(request);
}
