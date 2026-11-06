import { BaseService } from "@/core/base/BaseService";
import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  CreateExamInput,
  ExamSnapshotDTO,
  UpdateExamInput,
} from "../domain/dto/ExamSnapshotDTO";
import type { ExamEntity } from "../domain/entities/ExamEntity";
import type { ExamRepositoryInterface } from "../domain/interfaces/ExamRepositoryInterface";
import type { CreateExamUseCase } from "./usecases/CreateExamUseCase";
import type {
  GetExamSnapshotInput,
  GetExamSnapshotUseCase,
} from "./usecases/GetExamSnapshotUseCase";
import type { UpdateExamUseCase } from "./usecases/UpdateExamUseCase";

interface CacheEntry {
  data: ExamSnapshotDTO;
  expiresAt: number;
}

export class ExamService extends BaseService {
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
    private readonly examRepository: ExamRepositoryInterface,
    private readonly getExamSnapshotUseCase: GetExamSnapshotUseCase,
    private readonly createExamUseCase: CreateExamUseCase,
    private readonly updateExamUseCase: UpdateExamUseCase,
  ) {
    super();
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

    // 3. Initiate single-flight request
    const inFlightPromise = (async () => {
      try {
        const result = await this.getExamSnapshotUseCase.execute(input);
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

  public async createExam(
    input: CreateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    return await this.createExamUseCase.execute(input);
  }

  public async updateExam(
    input: UpdateExamInput,
  ): Promise<Result<ExamSnapshotDTO, AppError>> {
    const result = await this.updateExamUseCase.execute(input);
    if (result.isSuccess) {
      this.invalidateCache(input.id);
    }
    return result;
  }

  public async listExams(): Promise<ExamEntity[]> {
    return (await this.examRepository.findAll)
      ? await this.examRepository.findAll()
      : [];
  }

  public async getExamById(id: string): Promise<ExamEntity | null> {
    return await this.examRepository.findById(id);
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
