import { syncWorker } from "@/modules/sync/application/SyncWorker";
import { SyncService } from "@/modules/sync/application/service/SyncService";
import { HandleMoodleWebhookUseCase } from "@/modules/sync/application/usecases/HandleMoodleWebhookUseCase";
import { PullMoodleMasterDataUseCase } from "@/modules/sync/application/usecases/PullMoodleMasterDataUseCase";
import { PushEntityToMoodleUseCase } from "@/modules/sync/application/usecases/PushEntityToMoodleUseCase";
import { SyncController } from "@/modules/sync/infrastructure/SyncController";
import { SyncRepository } from "@/modules/sync/infrastructure/SyncRepository";

export function createSyncController(): SyncController {
  const syncRepository = new SyncRepository();
  const pullUseCase = new PullMoodleMasterDataUseCase(syncRepository);
  const handleWebhookUseCase = new HandleMoodleWebhookUseCase(
    syncRepository,
    pullUseCase,
  );
  const pushUseCase = new PushEntityToMoodleUseCase(syncRepository);

  const syncService = new SyncService(
    pullUseCase,
    handleWebhookUseCase,
    pushUseCase,
    syncWorker,
    syncRepository,
  );

  return new SyncController(syncService);
}

export const syncController = createSyncController();
