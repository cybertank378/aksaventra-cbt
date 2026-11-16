import type { SyncResult, SyncWorkerStatus } from "../domain/dto/SyncDTO";
import { type MoodleSyncService, moodleSyncService } from "./MoodleSyncService";

const DEFAULT_SYNC_INTERVAL_MS = 60_000;

export class SyncWorkerManager {
  private timer: ReturnType<typeof setInterval> | null = null;
  private isSyncing = false;
  private started = false;
  private intervalMs = DEFAULT_SYNC_INTERVAL_MS;
  private lastSyncedAt: string | null = null;
  private lastResult: SyncResult | null = null;
  private lastError: string | null = null;

  constructor(private readonly syncService: MoodleSyncService) {}

  public start(intervalMs?: number): void {
    if (this.started || process.env.NODE_ENV === "test") {
      return;
    }

    const configured = Number(process.env.MOODLE_SYNC_INTERVAL_MS);
    this.intervalMs =
      intervalMs ??
      (Number.isFinite(configured) && configured >= 5_000
        ? configured
        : DEFAULT_SYNC_INTERVAL_MS);

    this.started = true;

    // Initial sync shortly after server boot
    setTimeout(() => {
      void this.runOnce();
    }, 2_000);

    // Periodic background sync
    this.timer = setInterval(() => {
      void this.runOnce();
    }, this.intervalMs);

    if (typeof this.timer.unref === "function") {
      this.timer.unref();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.started = false;
  }

  public async runOnce(): Promise<SyncResult> {
    if (this.isSyncing) {
      return (
        this.lastResult ?? {
          success: true,
          counts: {
            courses: 0,
            classes: 0,
            students: 0,
            exams: 0,
            questions: 0,
          },
          syncedAt: new Date().toISOString(),
          errors: ["Sync already in progress"],
        }
      );
    }

    this.isSyncing = true;
    try {
      const result = await this.syncService.pullAllFromMoodle();
      this.lastResult = result;
      this.lastSyncedAt = result.syncedAt;
      this.lastError =
        result.errors.length > 0 ? result.errors.join("; ") : null;
      return result;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sync worker failed";
      this.lastError = msg;
      const failResult: SyncResult = {
        success: false,
        counts: { courses: 0, classes: 0, students: 0, exams: 0, questions: 0 },
        syncedAt: new Date().toISOString(),
        errors: [msg],
      };
      this.lastResult = failResult;
      return failResult;
    } finally {
      this.isSyncing = false;
    }
  }

  public getStatus(): SyncWorkerStatus {
    return {
      started: this.started,
      isSyncing: this.isSyncing,
      intervalMs: this.intervalMs,
      lastSyncedAt: this.lastSyncedAt,
      lastResult: this.lastResult,
      lastError: this.lastError,
    };
  }
}

const globalForSync = globalThis as unknown as {
  __aksaventraSyncWorker?: SyncWorkerManager;
};

export const syncWorker =
  globalForSync.__aksaventraSyncWorker ??
  new SyncWorkerManager(moodleSyncService);

if (process.env.NODE_ENV !== "production") {
  globalForSync.__aksaventraSyncWorker = syncWorker;
}

export function ensureSyncWorkerStarted(): void {
  syncWorker.start();
}
