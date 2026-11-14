import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ProctorActionResponseDTO } from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";

export interface ForceSubmitInput {
  attemptId: string;
  examId: string;
  proctorId?: string;
  reason?: string;
}

export class ForceSubmitAttemptUseCase
  implements BaseUseCase<ForceSubmitInput, ProctorActionResponseDTO, AppError>
{
  constructor(private readonly proctorRepo: ProctorRepositoryInterface) {}

  public async execute(
    input: ForceSubmitInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    const examMeta = await this.proctorRepo.getExamMetadata(input.examId);
    if (!examMeta) {
      return Result.fail(DomainError.notFound("Exam", input.examId));
    }

    // Force submit will calculate score from existing answers in repo
    const success = await this.proctorRepo.forceSubmitAttempt(
      input.attemptId,
      0, // calculated within repository or set to current calculated score
      input.proctorId,
      input.reason,
    );

    if (!success) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    return Result.ok({
      attemptId: input.attemptId,
      action: "force_submit",
      success: true,
      status: "SUBMITTED",
      strikeCount: 0,
      message: "Attempt forcefully submitted by proctor",
    });
  }
}
