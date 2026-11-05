import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import type { UserRole } from "@/security/rbacConfig";
import type { UsersService } from "../application/UsersService";

export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  public async getMe(request: NextRequest): Promise<NextResponse> {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "User authentication context is missing",
          },
        },
        { status: 401 },
      );
    }

    const result = await this.usersService.getProfile(userId);
    return this.handleResult(result, 200);
  }

  public async listUsers(request: NextRequest): Promise<NextResponse> {
    const { searchParams } = request.nextUrl;
    const role = (searchParams.get("role") as UserRole) || undefined;
    const roomCode = searchParams.get("roomCode") || undefined;
    const search = searchParams.get("search") || undefined;
    const pageParam = searchParams.get("page");
    const limitParam = searchParams.get("limit");
    const page = pageParam ? Number.parseInt(pageParam, 10) : 1;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 20;

    const result = await this.usersService.listUsers({
      role,
      roomCode,
      search,
      page,
      limit,
    });

    return this.handleResult(result, 200);
  }
}
