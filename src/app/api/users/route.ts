import type { NextRequest } from "next/server";
import { usersController } from "./_factory";

export async function GET(request: NextRequest): Promise<Response> {
  return await usersController.listUsers(request);
}

export async function POST(request: NextRequest): Promise<Response> {
  return await usersController.createStaffUser(request);
}
