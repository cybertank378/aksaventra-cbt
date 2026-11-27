import type { NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { DomainError } from "@/core/errors/DomainError";
import { handleZodError } from "@/core/errors/handleZodError";
import { requireRequestRole } from "@/security/serverAuth";
import type { UsersService } from "../application/service/UsersService";
import {
  bulkUpdateRoleSchema,
  createStaffUserSchema,
  listUsersQuerySchema,
  updateStaffUserSchema,
} from "./users.validator";

export class UsersController extends BaseController {
  constructor(private readonly usersService: UsersService) {
    super();
  }

  public async getMe(request: NextRequest): Promise<NextResponse> {
    const userId = request.headers.get("x-user-id");
    if (!userId) {
      return this.handleResult(
        Result.fail(
          DomainError.unauthorized("User authentication context is missing"),
        ),
      );
    }

    const result = await this.usersService.getProfile(userId);
    return this.handleResult(result, 200);
  }

  public async listUsers(request: NextRequest): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
    if (errorResponse) {
      return errorResponse;
    }

    const { searchParams } = request.nextUrl;
    const parsed = listUsersQuerySchema.safeParse({
      role: searchParams.get("role") || undefined,
      excludeRole: searchParams.get("excludeRole") || undefined,
      roomCode: searchParams.get("roomCode") || undefined,
      search: searchParams.get("search") || undefined,
      page: searchParams.get("page") || undefined,
      limit: searchParams.get("limit") || undefined,
    });
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.usersService.listUsers(parsed.data);
    const response = this.handleResult(result, 200);
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate",
    );
    return response;
  }

  public async createStaffUser(request: NextRequest): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
    if (errorResponse) {
      return errorResponse;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return this.handleResult(
        Result.fail(DomainError.badRequest("Format request JSON tidak valid.")),
      );
    }

    const parsed = createStaffUserSchema.safeParse(body);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.usersService.createStaffUser(parsed.data);
    return this.handleResult(result, 201);
  }

  public async updateStaffUser(
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> {
    const { errorResponse } = await requireRequestRole(request, ["ADMIN"]);
    if (errorResponse) {
      return errorResponse;
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return this.handleResult(
        Result.fail(DomainError.badRequest("Format request JSON tidak valid.")),
      );
    }

    const parsed = updateStaffUserSchema.safeParse(body);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.usersService.updateStaffUser({
      id,
      ...parsed.data,
    });
    return this.handleResult(result, 200);
  }

  public async deleteStaffUser(
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> {
    const { session, errorResponse } = await requireRequestRole(request, [
      "ADMIN",
    ]);
    if (errorResponse || !session) {
      return (
        errorResponse ??
        this.handleResult(
          Result.fail(DomainError.unauthorized("Autentikasi diperlukan.")),
        )
      );
    }

    const result = await this.usersService.deleteStaffUser({
      id,
      actorUserId: session.userId,
    });
    return this.handleResult(result, 200);
  }

  public async bulkUpdateRole(request: NextRequest): Promise<NextResponse> {
    const { session, errorResponse } = await requireRequestRole(request, [
      "ADMIN",
    ]);
    if (errorResponse || !session) {
      return (
        errorResponse ??
        this.handleResult(
          Result.fail(DomainError.unauthorized("Autentikasi diperlukan.")),
        )
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return this.handleResult(
        Result.fail(DomainError.badRequest("Format request JSON tidak valid.")),
      );
    }

    const parsed = bulkUpdateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return this.handleResult(Result.fail(handleZodError(parsed.error)));
    }

    const result = await this.usersService.bulkUpdateUserRoles({
      ...parsed.data,
      actorUserId: session.userId,
    });
    return this.handleResult(result, 200);
  }
}
