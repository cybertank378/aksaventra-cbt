import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import type {
  SubmitAttemptInputDTO,
  SubmitAttemptResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";
import { AnswerRehydrationRule } from "../../domain/rules/AnswerRehydrationRule";

export class SubmitAttemptUseCase
  implements
    BaseUseCase<SubmitAttemptInputDTO, SubmitAttemptResponseDTO, AppError>
{
  constructor(
    private readonly attemptRepo: AttemptRepositoryInterface,
    private readonly examRepo: ExamRepositoryInterface,
  ) {}

  public async execute(
    input: SubmitAttemptInputDTO,
  ): Promise<Result<SubmitAttemptResponseDTO, AppError>> {
    const attempt = await this.attemptRepo.findById(input.attemptId);
    if (!attempt) {
      return Result.fail(DomainError.notFound("Attempt", input.attemptId));
    }

    if (attempt.isSubmitted()) {
      return Result.fail(
        DomainError.conflict("Attempt has already been submitted"),
      );
    }

    // Merge in-flight final answers if provided
    let allAnswers = attempt.answers;
    if (input.finalAnswers && input.finalAnswers.length > 0) {
      const rehydration = AnswerRehydrationRule.rehydrate(
        attempt.answers,
        input.finalAnswers,
      );
      allAnswers = rehydration.mergedAnswers;

      // Persist final answers
      const entities = Array.from(rehydration.mergedAnswers.values());
      await this.attemptRepo.syncBatchAnswers(
        input.attemptId,
        entities,
        attempt.syncVersion,
      );
    }

    // Calculate score in-memory against private answer keys
    const answerKeys = await this.examRepo.getAnswerKeys(attempt.examId);
    let finalScore = 0;

    if (answerKeys && Object.keys(answerKeys).length > 0) {
      const totalQuestions = Object.keys(answerKeys).length;
      let correctCount = 0;

      for (const [qidStr, expectedKey] of Object.entries(answerKeys)) {
        const qid = Number.parseInt(qidStr, 10);
        const record = allAnswers.get(qid);
        if (!record || record.answer === null || record.answer === undefined) {
          continue;
        }

        const formattedExpected = String(expectedKey).trim().toLowerCase();
        let formattedStudent = "";

        if (Array.isArray(record.answer)) {
          formattedStudent = record.answer
            .map((a) => String(a).trim().toLowerCase())
            .sort()
            .join(",");
        } else if (typeof record.answer === "object") {
          formattedStudent = JSON.stringify(record.answer).toLowerCase();
        } else {
          formattedStudent = String(record.answer).trim().toLowerCase();
        }

        if (formattedExpected === formattedStudent) {
          correctCount++;
        }
      }

      finalScore =
        totalQuestions > 0
          ? Math.round((correctCount / totalQuestions) * 10000) / 100
          : 0;
    }

    const finishedAt = new Date();
    await this.attemptRepo.submitAttempt(
      input.attemptId,
      finalScore,
      finishedAt,
    );

    return Result.ok({
      attemptId: input.attemptId,
      status: "SUBMITTED",
      finishedAt: finishedAt.toISOString(),
      finalScore,
      syncedToMoodle: false,
    });
  }
}
