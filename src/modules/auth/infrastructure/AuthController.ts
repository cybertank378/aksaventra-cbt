import { type NextRequest, NextResponse } from "next/server";
import { BaseController } from "@/core/base/BaseController";
import { Result } from "@/core/base/Result";
import { handleZodError } from "@/core/errors/handleZodError";
import type { AuthService } from "../application/service/AuthService";
import {
  loginSchema,
  moodleLaunchSchema,
  verifyExamTokenSchema,
} from "./auth.validator";

export class AuthController extends BaseController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  private isSecureRequest(request?: NextRequest): boolean {
    if (!request) {
      return false;
    }
    const forwardedProto = request.headers
      .get("x-forwarded-proto")
      ?.split(",")[0]
      ?.trim()
      .toLowerCase();
    if (forwardedProto) {
      return forwardedProto === "https";
    }
    return request.nextUrl.protocol === "https:";
  }

  public async login(request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Format request tidak valid",
          },
        },
        { status: 400 },
      );
    }

    const parseResult = loginSchema.safeParse(body);
    if (!parseResult.success) {
      return this.handleResult(Result.fail(handleZodError(parseResult.error)));
    }

    try {
      // Attach client IP if not passed in body
      const ipAddress =
        parseResult.data.ipAddress ||
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "127.0.0.1";

      const result = await this.authService.login({
        ...parseResult.data,
        ipAddress,
      });

      if (result.isFailure) {
        return this.handleResult(result);
      }

      const response = this.handleResult(result, 200);

      // Set HTTP-Only session cookie
      response.cookies.set("aksaventra_token", result.value.token, {
        httpOnly: true,
        secure: this.isSecureRequest(request),
        sameSite: "lax",
        path: "/",
        maxAge: result.value.expiresInSeconds,
      });

      return response;
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              err instanceof Error
                ? err.message
                : "Terjadi kesalahan internal server",
          },
        },
        { status: 500 },
      );
    }
  }

  public async logout(request?: NextRequest): Promise<NextResponse> {
    const result = await this.authService.logout({});
    const response = this.handleResult(result, 200);

    // Clear HTTP-Only session cookie
    response.cookies.set("aksaventra_token", "", {
      httpOnly: true,
      secure: this.isSecureRequest(request),
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return response;
  }

  public async verifyExamToken(request: NextRequest): Promise<NextResponse> {
    try {
      const body = await request.json();
      const parseResult = verifyExamTokenSchema.safeParse(body);

      if (!parseResult.success) {
        return this.handleResult(
          Result.fail(handleZodError(parseResult.error)),
        );
      }

      const result = await this.authService.verifyExamToken(parseResult.data);
      return this.handleResult(result, 200);
    } catch (_err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Format request tidak valid",
          },
        },
        { status: 400 },
      );
    }
  }

  public async moodleLaunch(request: NextRequest): Promise<NextResponse> {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Format request tidak valid",
          },
        },
        { status: 400 },
      );
    }

    const parseResult = moodleLaunchSchema.safeParse(body);
    if (!parseResult.success) {
      return this.handleResult(Result.fail(handleZodError(parseResult.error)));
    }

    try {
      const ipAddress =
        parseResult.data.ipAddress ||
        request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
        "127.0.0.1";

      const result = await this.authService.exchangeMoodleLaunch({
        ...parseResult.data,
        ipAddress,
      });

      if (result.isFailure) {
        return this.handleResult(result);
      }

      const response = this.handleResult(result, 200);

      response.cookies.set("aksaventra_token", result.value.token, {
        httpOnly: true,
        secure: this.isSecureRequest(request),
        sameSite: "lax",
        path: "/",
        maxAge: 43200,
      });

      return response;
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message:
              err instanceof Error
                ? err.message
                : "Terjadi kesalahan internal server",
          },
        },
        { status: 500 },
      );
    }
  }
}
