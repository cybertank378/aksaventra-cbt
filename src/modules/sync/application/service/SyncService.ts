import { Result } from "@/core/base/Result";
import type { AppError } from "@/core/errors/AppError";
import type {
  MoodleWebhookPayload,
  OutboundSyncResult,
  PushEntityInput,
  SyncResult,
  SyncWorkerStatus,
  TriggerSyncInput,
} from "../../domain/dto/SyncDTO";
import type { SyncRepositoryInterface } from "../../domain/interfaces/SyncRepositoryInterface";
import type { SyncWorkerManager } from "../SyncWorker";
import type { HandleMoodleWebhookUseCase } from "../usecases/HandleMoodleWebhookUseCase";
import type { PullMoodleMasterDataUseCase } from "../usecases/PullMoodleMasterDataUseCase";
import type { PushEntityToMoodleUseCase } from "../usecases/PushEntityToMoodleUseCase";

export class SyncService {
  constructor(
    private readonly pullMasterDataUseCase: PullMoodleMasterDataUseCase,
    private readonly handleWebhookUseCase: HandleMoodleWebhookUseCase,
    private readonly pushEntityUseCase: PushEntityToMoodleUseCase,
    private readonly worker?: SyncWorkerManager,
    private readonly syncRepository?: SyncRepositoryInterface,
  ) {}

  public async pullMasterData(
    input: TriggerSyncInput = { entity: "all" },
  ): Promise<Result<SyncResult, AppError>> {
    if ((!input.entity || input.entity === "all") && this.worker) {
      const workerResult = await this.worker.runOnce();
      return Result.ok(workerResult);
    }
    return await this.pullMasterDataUseCase.execute(input);
  }

  public async syncAllBidirectional(): Promise<Result<SyncResult, AppError>> {
    await this.syncRepository?.pushPendingLocalToMoodle?.();
    return await this.pullMasterData({ entity: "all" });
  }

  public async handleWebhook(
    payload: MoodleWebhookPayload,
  ): Promise<Result<SyncResult, AppError>> {
    return await this.handleWebhookUseCase.execute(payload);
  }

  public async pushEntity(
    input: PushEntityInput,
  ): Promise<Result<OutboundSyncResult, AppError>> {
    return await this.pushEntityUseCase.execute(input);
  }

  public async pushEntityById(
    entity: "class" | "student" | "subject" | "exam" | "question",
    id: string,
  ): Promise<Result<OutboundSyncResult, AppError>> {
    return await this.pushEntityUseCase.pushById(entity, id);
  }

  public getStatus(): SyncWorkerStatus {
    if (this.worker) {
      return this.worker.getStatus();
    }
    return {
      started: false,
      isSyncing: false,
      intervalMs: 60_000,
      lastSyncedAt: null,
      lastResult: null,
      lastError: null,
    };
  }
}
