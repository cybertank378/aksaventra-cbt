import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import type {
  AnswerValue,
  SubmitAttemptInputDTO,
  SubmitAttemptResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";
import { AnswerRehydrationRule } from "../../domain/rules/AnswerRehydrationRule";
import {
  type QuestionScoreMeta,
  ScoreCalculatorRule,
} from "../../domain/rules/ScoreCalculatorRule";

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

    // Calculate weighted score in-memory aligned with Moodle 5 grading rules
    const [answerKeys, exam] = await Promise.all([
      this.examRepo.getAnswerKeys(attempt.examId),
      Promise.resolve(this.examRepo.findById(attempt.examId)).catch(() => null),
    ]);

    let finalScore = 0;
    let requiresManualGrading = false;

    if (answerKeys && Object.keys(answerKeys).length > 0) {
      const questionLookup = new Map<
        string,
        { type?: string; points?: number; tolerance?: number | null }
      >();

      if (exam && Array.isArray(exam.questions)) {
        for (const q of exam.questions) {
          questionLookup.set(String(q.questionId), {
            type: q.type,
            points: q.points ?? q.maxScore,
            tolerance: q.tolerance,
          });
        }
      }

      const questionMetaMap: Record<string, QuestionScoreMeta> = {};
      for (const [qidStr, rawKey] of Object.entries(answerKeys)) {
        const qMeta = questionLookup.get(qidStr);
        if (
          rawKey &&
          typeof rawKey === "object" &&
          !Array.isArray(rawKey) &&
          "key" in (rawKey as Record<string, unknown>)
        ) {
          const structured = rawKey as {
            type?: string;
            weight?: number;
            points?: number;
            tolerance?: number | null;
            key: unknown;
          };
          questionMetaMap[qidStr] = {
            type: structured.type ?? qMeta?.type ?? "multichoice",
            weight:
              structured.weight ?? structured.points ?? qMeta?.points ?? 1,
            tolerance: structured.tolerance ?? qMeta?.tolerance ?? null,
            key: structured.key,
          };
        } else {
          questionMetaMap[qidStr] = {
            type: qMeta?.type ?? "multichoice",
            weight: qMeta?.points ?? 1,
            tolerance: qMeta?.tolerance ?? null,
            key: rawKey,
          };
        }
      }

      const submittedMap = new Map<number, AnswerValue>();
      for (const [qid, record] of allAnswers.entries()) {
        submittedMap.set(qid, record.answer);
      }

      const scoreResult = ScoreCalculatorRule.calculateExamScore(
        questionMetaMap,
        submittedMap,
        100,
      );
      finalScore = scoreResult.finalScore;
      requiresManualGrading = scoreResult.requiresManualGrading;
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
      requiresManualGrading,
      syncedToMoodle: false,
    });
  }
}
