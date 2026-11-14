import type { BaseUseCase } from "@/core/base/BaseUseCase";
import { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import { DomainError } from "@/core/errors/DomainError";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import type {
  AnswerItemDTO,
  StartAttemptInputDTO,
  StartAttemptResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import { AttemptSessionEntity } from "../../domain/entities/AttemptSessionEntity";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";

export class StartAttemptUseCase
  implements
    BaseUseCase<StartAttemptInputDTO, StartAttemptResponseDTO, AppError>
{
  constructor(
    private readonly attemptRepo: AttemptRepositoryInterface,
    private readonly examRepo: ExamRepositoryInterface,
  ) {}

  public async execute(
    input: StartAttemptInputDTO,
  ): Promise<Result<StartAttemptResponseDTO, AppError>> {
    const existing = await this.attemptRepo.findByExamAndUser(
      input.examId,
      input.userId,
    );

    // If student already has an attempt
    if (existing) {
      if (existing.isSubmitted()) {
        return Result.fail(
          DomainError.conflict("Exam attempt has already been submitted"),
        );
      }

      // Rehydrate existing attempt session
      const answersMap: Record<string, AnswerItemDTO> = {};
      for (const [qid, rec] of existing.answers.entries()) {
        answersMap[String(qid)] = rec.toDTO();
      }

      const exam = await this.examRepo.findById(existing.examId);
      const durationSeconds = exam?.durationSeconds ?? 7200;

      return Result.ok({
        attemptId: existing.id,
        examId: existing.examId,
        userId: existing.userId,
        status: existing.status,
        startedAt: existing.startedAt.toISOString(),
        durationSeconds,
        extraTimeSeconds: existing.extraTimeSeconds,
        maxStrikes: existing.maxStrikes,
        strikeCount: existing.strikeCount,
        questionOrder: existing.questionOrder,
        answers: answersMap,
        syncVersion: existing.syncVersion,
      });
    }

    // New attempt creation
    const exam = await this.examRepo.findById(input.examId);
    if (!exam) {
      return Result.fail(DomainError.notFound("Exam", input.examId));
    }

    // Check token if provided
    if (input.roomToken && input.roomToken !== exam.activeToken) {
      return Result.fail(DomainError.badRequest("Invalid exam room token"));
    }

    const now = new Date();
    if (now < exam.timeOpen || now > exam.timeClose) {
      return Result.fail(
        DomainError.forbidden("Exam schedule window is not active"),
      );
    }

    // Generate questionOrder from exam snapshot slots
    const questionOrder =
      exam.questions.length > 0 ? exam.questions.map((q) => q.questionId) : [];

    const newAttempt = new AttemptSessionEntity({
      id: crypto.randomUUID(),
      examId: exam.id,
      userId: input.userId,
      status: "IN_PROGRESS",
      startedAt: now,
      extraTimeSeconds: 0,
      strikeCount: 0,
      maxStrikes: exam.maxStrikes,
      deviceHash: input.deviceHash,
      ipAddress: input.ipAddress,
      questionOrder,
      answers: new Map(),
      syncVersion: 0,
      syncedToMoodle: false,
      lastHeartbeatAt: now,
    });

    const saved = await this.attemptRepo.save(newAttempt);

    return Result.ok({
      attemptId: saved.id,
      examId: saved.examId,
      userId: saved.userId,
      status: saved.status,
      startedAt: saved.startedAt.toISOString(),
      durationSeconds: exam.durationSeconds,
      extraTimeSeconds: saved.extraTimeSeconds,
      maxStrikes: saved.maxStrikes,
      strikeCount: saved.strikeCount,
      questionOrder: saved.questionOrder,
      answers: {},
      syncVersion: saved.syncVersion,
    });
  }
}
