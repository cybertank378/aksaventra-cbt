import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { prisma } from "@/libs/prisma";
import type { ProctorActionResponseDTO } from "../../domain/dto/ProctorActionDTO";

export interface LockParticipantInput {
  attemptId: string;
  proctorId?: string;
  reason?: string;
}

export class LockParticipantUseCase
  implements
    BaseUseCase<LockParticipantInput, ProctorActionResponseDTO, AppError>
{
  async execute(
    input: LockParticipantInput,
  ): Promise<Result<ProctorActionResponseDTO, AppError>> {
    const {
      attemptId,
      proctorId = "proctor",
      reason = "Manual lock by proctor",
    } = input;

    await prisma.$transaction(async (tx) => {
      await tx.violationLog.create({
        data: {
          attemptId,
          eventType: "DEVTOOLS_OPEN", // Or violation indicator
          details: {
            proctorId,
            reason,
            timestamp: new Date().toISOString(),
          },
        },
      });

      await tx.attempt.update({
        where: { id: attemptId },
        data: {
          status: "LOCKED",
          strikeCount: 3,
        },
      });
    });

    return Result.ok({
      success: true,
      action: "lock",
      attemptId,
      status: "LOCKED",
      strikeCount: 3,
      message: `Peserta berhasil dikunci secara manual oleh pengawas (${reason})`,
    });
  }
}
