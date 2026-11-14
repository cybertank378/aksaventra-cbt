import { BaseService } from "@/core/application/BaseService";
import type { Result } from "@/core/domain/Result";
import type { AppError } from "@/core/errors/AppError";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";
import type {
  RecordViolationInputDTO,
  RecordViolationResponseDTO,
  StartAttemptInputDTO,
  StartAttemptResponseDTO,
  SubmitAttemptInputDTO,
  SubmitAttemptResponseDTO,
  SyncBatchRequestDTO,
  SyncBatchResponseDTO,
} from "../../domain/dto/SyncBatchDTO";
import type { AttemptRepositoryInterface } from "../../domain/interfaces/AttemptRepositoryInterface";
import { RecordViolationUseCase } from "../usecases/RecordViolationUseCase";
import { StartAttemptUseCase } from "../usecases/StartAttemptUseCase";
import { SubmitAttemptUseCase } from "../usecases/SubmitAttemptUseCase";
import { SyncAnswerQueueUseCase } from "../usecases/SyncAnswerQueueUseCase";

/* ============================================================
 * ATTEMPT SERVICE
 * ============================================================
 * Responsibility:
 * - Application Facade & UseCase Orchestrator
 * - Thin Application Entry Point
 * - Delegates all operations to dedicated Use Cases
 * - ZERO direct repository access
 * ============================================================
 */
export class AttemptService extends BaseService {
  private readonly startAttemptUseCase: StartAttemptUseCase;
  private readonly syncAnswerQueueUseCase: SyncAnswerQueueUseCase;
  private readonly recordViolationUseCase: RecordViolationUseCase;
  private readonly submitAttemptUseCase: SubmitAttemptUseCase;

  constructor(
    attemptRepo: AttemptRepositoryInterface,
    examRepo: ExamRepositoryInterface,
    useCases?: {
      startAttemptUseCase?: StartAttemptUseCase;
      syncAnswerQueueUseCase?: SyncAnswerQueueUseCase;
      recordViolationUseCase?: RecordViolationUseCase;
      submitAttemptUseCase?: SubmitAttemptUseCase;
    },
  ) {
    super("AttemptService");

    this.startAttemptUseCase =
      useCases?.startAttemptUseCase ??
      new StartAttemptUseCase(attemptRepo, examRepo);

    this.syncAnswerQueueUseCase =
      useCases?.syncAnswerQueueUseCase ??
      new SyncAnswerQueueUseCase(attemptRepo);

    this.recordViolationUseCase =
      useCases?.recordViolationUseCase ??
      new RecordViolationUseCase(attemptRepo);

    this.submitAttemptUseCase =
      useCases?.submitAttemptUseCase ??
      new SubmitAttemptUseCase(attemptRepo, examRepo);
  }

  public startAttempt(
    input: StartAttemptInputDTO,
  ): Promise<Result<StartAttemptResponseDTO, AppError>> {
    return this.execute(() => this.startAttemptUseCase.execute(input));
  }

  public syncBatchAnswers(
    input: SyncBatchRequestDTO,
  ): Promise<Result<SyncBatchResponseDTO, AppError>> {
    return this.execute(() => this.syncAnswerQueueUseCase.execute(input));
  }

  public recordViolation(
    input: RecordViolationInputDTO,
  ): Promise<Result<RecordViolationResponseDTO, AppError>> {
    return this.execute(() => this.recordViolationUseCase.execute(input));
  }

  public submitAttempt(
    input: SubmitAttemptInputDTO,
  ): Promise<Result<SubmitAttemptResponseDTO, AppError>> {
    return this.execute(() => this.submitAttemptUseCase.execute(input));
  }
}
