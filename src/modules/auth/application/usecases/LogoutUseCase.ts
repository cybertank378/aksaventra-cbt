import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";

export interface LogoutInput {
  token?: string;
  userId?: string;
}

export interface LogoutOutput {
  success: boolean;
  message: string;
}

export class LogoutUseCase
  implements BaseUseCase<LogoutInput, LogoutOutput, AppError>
{
  public async execute(
    _input: LogoutInput,
  ): Promise<Result<LogoutOutput, AppError>> {
    // In stateless JWT architecture with HTTP-only cookies, logout primarily clears the cookie.
    // If a distributed token blacklist is implemented in future phases, it can be invalidated here.
    return Result.ok({
      success: true,
      message: "Sesi berhasil diakhiri",
    });
  }
}
