import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  ExamSnapshotDTO,
  UpdateExamInput,
} from "../../domain/dto/ExamSnapshotDTO";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";

export class UpdateExamUseCase
  implements BaseUseCase<UpdateExamInput, ExamSnapshotDTO, AppError>
{
  constructor(private readonly examRepository: ExamRepositoryInterface) {}

  public async execute(
    input: UpdateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const existing = await this.examRepository.findById(input.id);
    if (!existing) {
      return Result.fail(
        new DomainError(
          `Ujian dengan ID '${input.id}' tidak ditemukan`,
          404,
          "EXAM_NOT_FOUND",
        ),
      );
    }

    if (input.activeToken && input.tokenExpiresAt) {
      await this.examRepository.updateRoomToken(
        input.id,
        input.activeToken,
        input.tokenExpiresAt,
      );
    }

    const updated = await this.examRepository.updateExamMetadata(input.id, {
      title: input.title,
      durationSeconds: input.durationSeconds,
      maxStrikes: input.maxStrikes,
      sebRequired: input.sebRequired,
      sebConfigKey: input.sebConfigKey,
      timeOpen: input.timeOpen,
      timeClose: input.timeClose,
    });

    return Result.ok(updated.toClientSnapshotDTO());
  }
}
