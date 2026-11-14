import { NextResponse } from "next/server";
import { ZodError } from "zod";
import type { Result } from "../base/Result";
import { AppError } from "../errors/AppError";
import { DomainError } from "../errors/DomainError";
import { formatZodError } from "../errors/handleZodError";
import { OptimisticLockError } from "../errors/OptimisticLockError";
import type { ApiResponse } from "../types/ApiResponse";

export class HttpResultHandler {
  public static handle<T, E = unknown>(
    result: Result<T, E>,
    successStatus = 200,
  ): NextResponse<ApiResponse<T>> {
    if (result.isSuccess) {
      return NextResponse.json(
        {
          success: true,
          data: result.value,
        },
        { status: successStatus },
      );
    }

    return HttpResultHandler.handleError(result.error);
  }

  public static handleError(error: unknown): NextResponse<ApiResponse<never>> {
    if (error instanceof ZodError) {
      const { message, fieldErrors } = formatZodError(error);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message,
            details: fieldErrors,
          },
        },
        { status: 422 },
      );
    }

    if (error instanceof OptimisticLockError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: 409 },
      );
    }

    if (error instanceof DomainError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.statusCode },
      );
    }

    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: error.code,
            message: error.message,
            details: error.details,
          },
        },
        { status: error.statusCode },
      );
    }

    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message,
        },
      },
      { status: 500 },
    );
  }
}
