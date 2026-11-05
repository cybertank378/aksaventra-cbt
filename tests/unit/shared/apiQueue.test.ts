import { describe, expect, it } from "vitest";
import {
  AsyncSyncMutex,
  getNextSyncDelayWithJitter,
} from "@/shared/api/apiQueue";

describe("apiQueue & Anti-Thundering Herd", () => {
  describe("getNextSyncDelayWithJitter", () => {
    it("produces delays strictly within [baseMs, baseMs + maxJitterMs]", () => {
      const baseMs = 20_000;
      const maxJitterMs = 4_000;

      for (let i = 0; i < 50; i++) {
        const delay = getNextSyncDelayWithJitter(baseMs, maxJitterMs);
        expect(delay).toBeGreaterThanOrEqual(baseMs);
        expect(delay).toBeLessThanOrEqual(baseMs + maxJitterMs);
      }
    });

    it("defaults to 20000ms base and 4000ms jitter", () => {
      const delay = getNextSyncDelayWithJitter();
      expect(delay).toBeGreaterThanOrEqual(20_000);
      expect(delay).toBeLessThanOrEqual(24_000);
    });
  });

  describe("AsyncSyncMutex", () => {
    it("executes tasks sequentially in FIFO order without overlapping", async () => {
      const mutex = new AsyncSyncMutex();
      const executionOrder: number[] = [];
      let isTaskRunning = false;

      const createTask = (id: number, delayMs: number) => async () => {
        expect(isTaskRunning).toBe(false); // Ensure no concurrent execution
        isTaskRunning = true;

        await new Promise((resolve) => setTimeout(resolve, delayMs));

        executionOrder.push(id);
        isTaskRunning = false;
        return id;
      };

      const [res1, res2, res3] = await Promise.all([
        mutex.runExclusive(createTask(1, 30)),
        mutex.runExclusive(createTask(2, 20)),
        mutex.runExclusive(createTask(3, 10)),
      ]);

      expect(res1).toBe(1);
      expect(res2).toBe(2);
      expect(res3).toBe(3);
      expect(executionOrder).toEqual([1, 2, 3]);
      expect(mutex.isBusy()).toBe(false);
    });

    it("tracks isBusy and waitForIdle correctly", async () => {
      const mutex = new AsyncSyncMutex();
      expect(mutex.isBusy()).toBe(false);

      const promise = mutex.runExclusive(async () => {
        expect(mutex.isBusy()).toBe(true);
        await new Promise((resolve) => setTimeout(resolve, 30));
        return "done";
      });

      expect(mutex.isBusy()).toBe(true);
      await mutex.waitForIdle();
      expect(mutex.isBusy()).toBe(false);

      const result = await promise;
      expect(result).toBe("done");
    });

    it("does not deadlock subsequent tasks when a previous task fails", async () => {
      const mutex = new AsyncSyncMutex();

      const failedTask = mutex.runExclusive(async () => {
        throw new Error("Sync failed");
      });

      const nextTask = mutex.runExclusive(async () => {
        return "recovered";
      });

      await expect(failedTask).rejects.toThrow("Sync failed");
      const result = await nextTask;
      expect(result).toBe("recovered");
      expect(mutex.isBusy()).toBe(false);
    });
  });
});
