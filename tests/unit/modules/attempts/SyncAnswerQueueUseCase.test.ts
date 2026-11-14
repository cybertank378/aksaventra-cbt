import { describe, expect, it, vi } from "vitest";
import { SyncAnswerQueueUseCase } from "@/modules/attempts/application/usecases/SyncAnswerQueueUseCase";
import { AttemptSessionEntity } from "@/modules/attempts/domain/entities/AttemptSessionEntity";
import type { AttemptRepositoryInterface } from "@/modules/attempts/domain/interfaces/AttemptRepositoryInterface";

describe("SyncAnswerQueueUseCase", () => {
  const mockAttempt = new AttemptSessionEntity({
    id: "attempt-sync-1",
    examId: "exam-1",
    userId: "user-1",
    status: "IN_PROGRESS",
    startedAt: new Date(),
    extraTimeSeconds: 0,
    strikeCount: 0,
    maxStrikes: 3,
    deviceHash: "hash",
    ipAddress: "127.0.0.1",
    questionOrder: [1, 2],
    answers: new Map(),
    syncVersion: 0,
    syncedToMoodle: false,
    lastHeartbeatAt: new Date(),
  });

  const mockRepo = {
    findById: vi.fn().mockResolvedValue(mockAttempt),
    findByExamAndUser: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    syncBatchAnswers: vi.fn().mockResolvedValue({
      success: true,
      syncVersion: 1,
      currentStatus: "IN_PROGRESS",
      syncedCount: 2,
    }),
    recordViolation: vi.fn(),
    submitAttempt: vi.fn(),
  } as unknown as AttemptRepositoryInterface;

  it("should sync answer batch and return new syncVersion", async () => {
    const useCase = new SyncAnswerQueueUseCase(mockRepo);

    const result = await useCase.execute({
      attemptId: "attempt-sync-1",
      answers: [
        { questionId: 1, ans: "A", flag: false, ts: 1000 },
        { questionId: 2, ans: "B", flag: true, ts: 1050 },
      ],
      syncVersion: 0,
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.syncedCount).toBe(2);
    expect(result.value.syncVersion).toBe(1);
    expect(result.value.status).toBe("IN_PROGRESS");
  });

  it("should forbid syncing if attempt is locked", async () => {
    const lockedAttempt = new AttemptSessionEntity({
      ...mockAttempt,
      id: "attempt-locked",
      status: "LOCKED",
      answers: new Map(),
    });

    const lockedRepo = {
      ...mockRepo,
      findById: vi.fn().mockResolvedValue(lockedAttempt),
    } as unknown as AttemptRepositoryInterface;

    const useCase = new SyncAnswerQueueUseCase(lockedRepo);
    const result = await useCase.execute({
      attemptId: "attempt-locked",
      answers: [{ questionId: 1, ans: "A", flag: false, ts: 1000 }],
      syncVersion: 0,
    });

    expect(result.isSuccess).toBe(false);
    expect(result.error.statusCode).toBe(403);
  });
});
