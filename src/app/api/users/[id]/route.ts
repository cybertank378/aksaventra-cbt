import type { NextRequest } from "next/server";
import { usersController } from "../_factory";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await usersController.updateStaffUser(request, id);
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await context.params;
  return await usersController.deleteStaffUser(request, id);
}
