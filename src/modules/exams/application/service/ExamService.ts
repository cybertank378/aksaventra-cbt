import { BaseService } from "@/core/base/BaseService";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  CreateExamInput,
  ExamSnapshotDTO,
  UpdateExamInput,
} from "../../domain/dto/ExamSnapshotDTO";
import type { ExamEntity } from "../../domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "../../domain/interfaces/ExamRepositoryInterface";
import { CreateExamUseCase } from "../usecases/CreateExamUseCase";
import { GetExamByIdUseCase } from "../usecases/GetExamByIdUseCase";
import {
  type GetExamSnapshotInput,
  GetExamSnapshotUseCase,
} from "../usecases/GetExamSnapshotUseCase";
import { ListExamsUseCase } from "../usecases/ListExamsUseCase";
import { UpdateExamUseCase } from "../usecases/UpdateExamUseCase";

interface CacheEntry {
  data: ExamSnapshotDTO;
  expiresAt: number;
}

/* ============================================================
 * EXAM SERVICE
 * ============================================================
 * Responsibility:
 * - Application Facade & UseCase Orchestrator
 * - Single-Flight Deduplication & In-Memory Snapshot Cache
 * - Delegates all data access to dedicated Use Cases
 * ============================================================
 */
export class ExamService extends BaseService {
  private readonly getExamSnapshotUseCase: GetExamSnapshotUseCase;
  private readonly createExamUseCase: CreateExamUseCase;
  private readonly updateExamUseCase: UpdateExamUseCase;
  private readonly listExamsUseCase: ListExamsUseCase;
  private readonly getExamByIdUseCase: GetExamByIdUseCase;

  /**
   * In-Memory TTL Cache and Single-Flight Deduplication.
   * Prevents Thundering Herd when hundreds of students load the exam simultaneously at T=0.
   */
  private snapshotCache = new Map<string, CacheEntry>();
  private inFlightRequests = new Map<
    string,
    Promise<Result<ExamSnapshotDTO, AppError>>
  >();
  private readonly CACHE_TTL_MS = 60_000; // 60 seconds

  constructor(
    repository: ExamRepositoryInterface,
    useCases?: {
      getExamSnapshotUseCase?: GetExamSnapshotUseCase;
      createExamUseCase?: CreateExamUseCase;
      updateExamUseCase?: UpdateExamUseCase;
      listExamsUseCase?: ListExamsUseCase;
      getExamByIdUseCase?: GetExamByIdUseCase;
    },
  ) {
    super("ExamService");

    this.getExamSnapshotUseCase =
      useCases?.getExamSnapshotUseCase ??
      new GetExamSnapshotUseCase(repository);
    this.createExamUseCase =
      useCases?.createExamUseCase ?? new CreateExamUseCase(repository);
    this.updateExamUseCase =
      useCases?.updateExamUseCase ?? new UpdateExamUseCase(repository);
    this.listExamsUseCase =
      useCases?.listExamsUseCase ?? new ListExamsUseCase(repository);
    this.getExamByIdUseCase =
      useCases?.getExamByIdUseCase ?? new GetExamByIdUseCase(repository);
  }

  public async getSnapshot(
    input: GetExamSnapshotInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const cacheKey = `exam_snapshot_${input.examId}`;
    const now = Date.now();

    // 1. Check in-memory TTL cache hit
    const cached = this.snapshotCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return Result.ok(cached.data);
    }

    // 2. Single-Flight request deduplication
    const existingInFlight = this.inFlightRequests.get(cacheKey);
    if (existingInFlight) {
      return await existingInFlight;
    }

    // 3. Initiate single-flight request delegating to UseCase
    const inFlightPromise = (async () => {
      try {
        const result = await this.execute(() =>
          this.getExamSnapshotUseCase.execute(input),
        );
        if (result.isSuccess) {
          this.snapshotCache.set(cacheKey, {
            data: result.value,
            expiresAt: Date.now() + this.CACHE_TTL_MS,
          });
        }
        return result;
      } finally {
        this.inFlightRequests.delete(cacheKey);
      }
    })();

    this.inFlightRequests.set(cacheKey, inFlightPromise);
    return await inFlightPromise;
  }

  public createExam(
    input: CreateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    return this.execute(() => this.createExamUseCase.execute(input));
  }

  public async updateExam(
    input: UpdateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const result = await this.execute(() =>
      this.updateExamUseCase.execute(input),
    );
    if (result.isSuccess) {
      this.invalidateCache(input.id);
    }
    return result;
  }

  public async listExams(): Promise<Result<ExamEntity[], AppError>> {
    return this.execute(() => this.listExamsUseCase.execute());
  }

  public async getExamById(id: string): Promise<Result<ExamEntity, AppError>> {
    return this.execute(() => this.getExamByIdUseCase.execute({ id }));
  }

  /**
   * Clears cached snapshot for an exam or all exams.
   */
  public invalidateCache(examId?: string): void {
    if (examId) {
      const cacheKey = `exam_snapshot_${examId}`;
      this.snapshotCache.delete(cacheKey);
      this.inFlightRequests.delete(cacheKey);
    } else {
      this.snapshotCache.clear();
      this.inFlightRequests.clear();
    }
  }
}
