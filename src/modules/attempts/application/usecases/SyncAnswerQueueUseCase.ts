import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  SyncBatchRequestDTO,
  SyncBatchResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import { AnswerRecordEntity } from "../../domain/entities/AnswerRecordEntity";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";

export class SyncAnswerQueueUseCase
  implements BaseUseCase<SyncBatchRequestDTO, SyncBatchResponseDTO, AppError>
{
  constructor(private readonly attemptRepo: AttemptRepositoryInterface) {}

  public async execute(
    input: SyncBatchRequestDTO,
  ): Promise<Result<SyncBatchResponseDTO, AppError>> {
    const attempt = await this.attemptRepo.findById(input.attemptId);
    if (!attempt) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    if (!attempt.canBeModified()) {
      return Result.fail(
        DomainError.forbidden(
          `Cannot sync answers: attempt is currently in ${attempt.status} status`,
        ),
      );
    }

    const answerEntities = input.answers.map((a) =>
      AnswerRecordEntity.fromDTO(a),
    );

    const syncResult = await this.attemptRepo.syncBatchAnswers(
      input.attemptId,
      answerEntities,
      input.syncVersion,
    );

    return Result.ok({
      syncedCount: syncResult.syncedCount,
      syncVersion: syncResult.syncVersion,
      serverTime: Date.now(),
      status: syncResult.currentStatus,
    });
  }
}
