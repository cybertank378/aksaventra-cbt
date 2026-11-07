import type { NextResponse } from "next/server";
import type { AppError } from "../errors/AppError";
import type { ApiResponse } from "../types/ApiResponse";
import { HttpResultHandler } from "../utils/HttpResultHandler";
import { Result } from "./Result";

export abstract class BaseController {
  protected handleResult<T, E = AppError>(
    result: Result<T, E>,
    successStatus = 200,
  ): NextResponse<ApiResponse<T>> {
    return HttpResultHandler.handle(result, successStatus);
  }

  protected handleUnexpectedError(error: unknown): NextResponse<ApiResponse<never>> {
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return HttpResultHandler.handle(
      Result.fail({
        statusCode: 500,
        code: "INTERNAL_SERVER_ERROR",
        message,
      } as unknown as AppError),
      500,
    );
  }
}
