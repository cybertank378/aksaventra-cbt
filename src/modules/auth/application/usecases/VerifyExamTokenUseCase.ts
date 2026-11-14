import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  VerifyExamTokenInput,
  VerifyExamTokenOutput,
} from "../../domain/dto/AuthDTO";
import type { AuthRepositoryInterface } from "../../domain/interfaces/AuthRepositoryInterface";

export class VerifyExamTokenUseCase
  implements BaseUseCase<VerifyExamTokenInput, VerifyExamTokenOutput, AppError>
{
  constructor(private readonly authRepository: AuthRepositoryInterface) {}

  public async execute(
    input: VerifyExamTokenInput,
  ): Promise<Result<VerifyExamTokenOutput, AppError>> {
    const { examId, token } = input;

    if (!token || token.trim() === "") {
      return Result.fail(
        new DomainError(
          "Token ruang ujian tidak boleh kosong",
          400,
          "INVALID_EXAM_TOKEN",
        ),
      );
    }

    // 1. Fetch exam metadata
    const exam = await this.authRepository.findExamById(examId);
    if (!exam) {
      return Result.fail(
        new DomainError("Ujian tidak ditemukan", 404, "EXAM_NOT_FOUND"),
      );
    }

    // 2. Validate token string equality (case-insensitive)
    const cleanInputToken = token.trim().toUpperCase();
    const cleanActiveToken = exam.activeToken.trim().toUpperCase();

    if (cleanInputToken !== cleanActiveToken) {
      return Result.fail(
        new DomainError(
          "Token ruang ujian salah. Pastikan Anda memasukkan 6 digit token yang diberikan pengawas.",
          400,
          "INVALID_EXAM_TOKEN",
        ),
      );
    }

    // 3. Verify expiration
    const now = new Date();
    if (now > exam.tokenExpiresAt) {
      return Result.fail(
        new DomainError(
          "Token ruang ujian telah kedaluwarsa. Silakan minta token baru kepada pengawas.",
          400,
          "EXAM_TOKEN_EXPIRED",
          {
            expiredAt: exam.tokenExpiresAt,
          },
        ),
      );
    }

    const remainingSeconds = Math.max(
      0,
      Math.floor((exam.tokenExpiresAt.getTime() - now.getTime()) / 1000),
    );

    return Result.ok({
      isValid: true,
      examId: exam.id,
      tokenExpiresAt: exam.tokenExpiresAt,
      remainingSeconds,
    });
  }
}
