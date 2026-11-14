import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ProctorActionResponseDTO } from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";

export interface ExtendParticipantTimeInput {
  attemptId: string;
  extendMinutes: number;
  proctorId?: string;
  reason?: string;
}

export class ExtendParticipantTimeUseCase
  implements
    BaseUseCase<ExtendParticipantTimeInput, ProctorActionResponseDTO, AppError>
{
  constructor(private readonly proctorRepo: ProctorRepositoryInterface) {}

  public async execute(
    input: ExtendParticipantTimeInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    if (!input.extendMinutes || input.extendMinutes <= 0) {
      return Result.fail(
        DomainError.badRequest("extendMinutes must be a positive number"),
      );
    }

    const additionalSeconds = Math.round(input.extendMinutes * 60);
    const result = await this.proctorRepo.extendAttemptTime(
      input.attemptId,
      additionalSeconds,
      input.proctorId,
      input.reason,
    );

    if (!result) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    return Result.ok({
      attemptId: input.attemptId,
      action: "extend_time",
      success: true,
      status: "IN_PROGRESS",
      strikeCount: 0,
      extraTimeSeconds: result.extraTimeSeconds,
      message: `Successfully extended attempt time by ${input.extendMinutes} minutes`,
    });
  }
}
