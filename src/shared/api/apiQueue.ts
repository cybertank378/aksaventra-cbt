/**
 * Aksaventra CBT Sync Queue & Anti-Thundering Herd Protection
 *
 * Implements:
 * 1. Monotonic jitter calculation to prevent concurrent request spikes from hundreds of students.
 * 2. AsyncSyncMutex sequential lock to ensure atomic sync batches and guarantee
 *    that Final Submit waits for in-flight background sync tasks to finish.
 */

/**
 * Calculates sync delay with random jitter.
 * Default base interval: 20,000ms (20s).
 * Default jitter: 0 - 4,000ms (0 - 4s).
 * Result range: 20,000ms - 24,000ms.
 */
export function getNextSyncDelayWithJitter(
  baseMs = 20_000,
  maxJitterMs = 4_000,
): number {
  const jitter = Math.floor(Math.random() * (maxJitterMs + 1));
  return baseMs + jitter;
}

/**
 * Sequential asynchronous mutex.
 * Enforces mutual exclusion for critical background sync tasks and final submission.
 */
export class AsyncSyncMutex {
  private queue: Promise<void> = Promise.resolve();
  private activeCount = 0;

  /**
   * Returns true if there is an active task running or tasks queued.
   */
  public isBusy(): boolean {
    return this.activeCount > 0;
  }

  /**
   * Returns the number of currently active and queued tasks.
   */
  public getPendingCount(): number {
    return this.activeCount;
  }

  /**
   * Executes a task exclusively in FIFO order.
   * If another task is in-flight, waits until it finishes before starting.
   */
  public async runExclusive<T>(task: () => Promise<T>): Promise<T> {
    this.activeCount++;

    return new Promise<T>((resolve, reject) => {
      this.queue = this.queue
        .then(async () => {
          try {
            const result = await task();
            resolve(result);
          } catch (err) {
            reject(err);
          } finally {
            this.activeCount--;
          }
        })
        .catch(() => {
          // Keep queue promise chain unbroken if an internal failure happens
        });
    });
  }

  /**
   * Waits for all in-flight and currently queued tasks to settle.
   */
  public async waitForIdle(): Promise<void> {
    while (this.activeCount > 0) {
      await this.queue;
    }
  }
}

/**
 * Global or default singleton instance of the sync mutex.
 */
export const syncMutex = new AsyncSyncMutex();
