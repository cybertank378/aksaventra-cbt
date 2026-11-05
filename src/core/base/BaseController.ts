import type { NextResponse } from "next/server";
import type { AppError } from "../errors/AppError";
import type { ApiResponse } from "../types/ApiResponse";
import { HttpResultHandler } from "../utils/HttpResultHandler";
import type { Result } from "./Result";

export abstract class BaseController {
  protected handleResult<T, E = AppError>(
    result: Result<T, E>,
    successStatus = 200,
  ): NextResponse<ApiResponse<T>> {
    return HttpResultHandler.handle(result, successStatus);
  }
}
