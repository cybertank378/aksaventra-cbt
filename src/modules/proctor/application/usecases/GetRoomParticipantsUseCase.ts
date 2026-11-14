import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  GetRoomParticipantsQueryDTO,
  GetRoomParticipantsResponseDTO,
} from "../../domain/dto/ProctorActionDTO";
import type { ProctorRepositoryInterface } from "../../domain/interfaces/ProctorRepositoryInterface";

export class GetRoomParticipantsUseCase
  implements
    BaseUseCase<
      GetRoomParticipantsQueryDTO,
      GetRoomParticipantsResponseDTO,
      AppError
    >
{
  constructor(private readonly proctorRepo: ProctorRepositoryInterface) {}

  public async execute(
    input: GetRoomParticipantsQueryDTO,
  ): Promise<Result<GetRoomParticipantsResponseDTO, AppError>> {
    const examMeta = await this.proctorRepo.getExamMetadata(input.examId);
    if (!examMeta) {
      return Result.fail(DomainError.notFound("Exam", input.examId));
    }

    const participants = await this.proctorRepo.getRoomParticipants(
      input.examId,
      input.roomCode,
      input.status,
    );

    const now = new Date();
    let onlineCount = 0;
    let lockedCount = 0;
    let submittedCount = 0;

    const participantDTOs = participants.map((p) => {
      if (p.isOnline(now)) onlineCount++;
      if (p.status === "LOCKED") lockedCount++;
      if (p.status === "SUBMITTED") submittedCount++;
      return p.toDTO(now);
    });

    return Result.ok({
      examId: input.examId,
      activeToken: examMeta.activeToken,
      tokenExpiresAt: examMeta.tokenExpiresAt.toISOString(),
      totalParticipants: participants.length,
      onlineCount,
      lockedCount,
      submittedCount,
      participants: participantDTOs,
    });
  }
}
