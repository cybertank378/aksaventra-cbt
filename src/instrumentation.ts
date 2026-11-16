export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureSyncWorkerStarted } = await import(
      "@/modules/sync/application/SyncWorker"
    );
    ensureSyncWorkerStarted();
  }
}
