import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ProctorActionResponseDTO } from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";

export interface UnlockParticipantInput {
  attemptId: string;
  proctorId?: string;
  reason?: string;
}

export class UnlockParticipantStrikeUseCase
  implements
    BaseUseCase<UnlockParticipantInput, ProctorActionResponseDTO, AppError>
{
  constructor(private readonly proctorRepo: ProctorRepositoryInterface) {}

  public async execute(
    input: UnlockParticipantInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    const success = await this.proctorRepo.unlockAttempt(
      input.attemptId,
      input.proctorId,
      input.reason,
    );

    if (!success) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    return Result.ok({
      attemptId: input.attemptId,
      action: "unlock",
      success: true,
      status: "IN_PROGRESS",
      strikeCount: 0,
      message: "Attempt successfully unlocked and strikes reset to 0",
    });
  }
}
