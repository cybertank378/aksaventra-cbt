import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type {
  RecordViolationInputDTO,
  RecordViolationResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import { SecurityStrikeEntity } from "../../domain/entities/SecurityStrikeEntity";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";
import { StrikeEvaluationRule } from "../../domain/rules/StrikeEvaluationRule";

export class RecordViolationUseCase
  implements
    BaseUseCase<RecordViolationInputDTO, RecordViolationResponseDTO, AppError>
{
  constructor(private readonly attemptRepo: AttemptRepositoryInterface) {}

  public async execute(
    input: RecordViolationInputDTO,
  ): Promise<Result<RecordViolationResponseDTO, AppError>> {
    const attempt = await this.attemptRepo.findById(input.attemptId);
    if (!attempt) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    if (attempt.isSubmitted()) {
      return Result.fail(
        DomainError.forbidden("Cannot report violation for submitted attempt"),
      );
    }

    const evaluation = StrikeEvaluationRule.evaluate({
      eventType: input.eventType,
      currentStrikeCount: attempt.strikeCount,
      maxStrikes: attempt.maxStrikes,
      durationMs: input.durationMs,
    });

    if (evaluation.shouldRecordLog) {
      const strikeEntity = new SecurityStrikeEntity({
        attemptId: input.attemptId,
        eventType: input.eventType,
        details: input.details,
      });

      await this.attemptRepo.recordViolation(
        input.attemptId,
        strikeEntity,
        evaluation.nextStrikeCount,
        evaluation.isLocked,
      );
    }

    const finalStatus = evaluation.isLocked
      ? "LOCKED"
      : evaluation.nextStrikeCount === 0 && input.eventType === "PROCTOR_UNLOCK"
        ? "IN_PROGRESS"
        : attempt.status;

    return Result.ok({
      attemptId: input.attemptId,
      strikeCount: evaluation.nextStrikeCount,
      maxStrikes: attempt.maxStrikes,
      status: finalStatus,
      isLocked: evaluation.isLocked,
      message: evaluation.reason,
    });
  }
}
