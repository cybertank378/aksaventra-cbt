import "fake-indexeddb/auto";
import { beforeEach, describe, expect, it } from "vitest";
import { DexieAttemptVault } from "@/libs/dexieVault";

describe("DexieAttemptVault (Offline IndexedDB Vault)", () => {
  let vault: DexieAttemptVault;

  beforeEach(async () => {
    // Generate fresh database name per test
    const dbName = `TestVault_${Date.now()}_${Math.random()}`;
    vault = new DexieAttemptVault(dbName);
    await vault.open();
  });

  it("saves an answer record with synced=false", async () => {
    await vault.saveAnswer("attempt-101", 12, "B", false);

    const unsynced = await vault.getUnsyncedAnswers("attempt-101");
    expect(unsynced).toHaveLength(1);
    expect(unsynced[0].questionId).toBe(12);
    expect(unsynced[0].answer).toBe("B");
    expect(unsynced[0].flagged).toBe(false);
    expect(unsynced[0].synced).toBe(false);
  });

  it("marks answered records as synced atomically", async () => {
    await vault.saveAnswer("attempt-101", 1, "A", false);
    await vault.saveAnswer("attempt-101", 2, "C", true);

    let unsynced = await vault.getUnsyncedAnswers("attempt-101");
    expect(unsynced).toHaveLength(2);

    await vault.markAnswersAsSynced("attempt-101", [1]);

    unsynced = await vault.getUnsyncedAnswers("attempt-101");
    expect(unsynced).toHaveLength(1);
    expect(unsynced[0].questionId).toBe(2);

    const all = await vault.getAllAnswers("attempt-101");
    const q1 = all.find((a) => a.questionId === 1);
    expect(q1?.synced).toBe(true);
  });

  it("saves and retrieves attempt metadata", async () => {
    const meta = {
      attemptId: "attempt-200",
      examId: 5,
      timeStart: 1700000000,
      durationSeconds: 3600,
      extraTimeSeconds: 0,
      maxStrikes: 3,
      strikeCount: 1,
      status: "in_progress",
      syncVersion: 2,
    };

    await vault.saveAttemptMeta(meta);

    const retrieved = await vault.getAttemptMeta("attempt-200");
    expect(retrieved).toBeDefined();
    expect(retrieved?.examId).toBe(5);
    expect(retrieved?.status).toBe("in_progress");
    expect(retrieved?.strikeCount).toBe(1);
  });

  it("clears all answers and metadata for a specific attempt upon final submit", async () => {
    await vault.saveAnswer("attempt-300", 1, "D");
    await vault.saveAnswer("attempt-300", 2, "A");
    await vault.saveAttemptMeta({
      attemptId: "attempt-300",
      examId: 10,
      timeStart: 1700000000,
      durationSeconds: 1800,
      extraTimeSeconds: 0,
      maxStrikes: 3,
      strikeCount: 0,
      status: "finished",
      syncVersion: 1,
    });

    // Also insert data for another attempt to verify isolation
    await vault.saveAnswer("attempt-999", 1, "B");

    await vault.clearAttempt("attempt-300");

    const remainingFor300 = await vault.getAllAnswers("attempt-300");
    expect(remainingFor300).toHaveLength(0);

    const meta300 = await vault.getAttemptMeta("attempt-300");
    expect(meta300).toBeUndefined();

    // Verify other attempt was not affected
    const remainingFor999 = await vault.getAllAnswers("attempt-999");
    expect(remainingFor999).toHaveLength(1);
  });
});
