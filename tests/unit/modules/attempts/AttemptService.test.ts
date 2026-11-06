import { describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import { AttemptService } from "@/modules/attempts/application/service/AttemptService";
import type { RecordViolationUseCase } from "@/modules/attempts/application/usecases/RecordViolationUseCase";
import type { StartAttemptUseCase } from "@/modules/attempts/application/usecases/StartAttemptUseCase";
import type { SubmitAttemptUseCase } from "@/modules/attempts/application/usecases/SubmitAttemptUseCase";
import type { SyncAnswerQueueUseCase } from "@/modules/attempts/application/usecases/SyncAnswerQueueUseCase";
import type { AttemptRepositoryInterface } from "@/modules/attempts/domain/interfaces/AttemptRepositoryInterface";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";

describe("AttemptService", () => {
  const mockStartUseCase = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        examId: "exam-1",
        userId: "user-1",
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
        durationSeconds: 7200,
        extraTimeSeconds: 0,
        maxStrikes: 3,
        strikeCount: 0,
        questionOrder: [1],
        answers: {},
        syncVersion: 0,
      }),
    ),
  };

  const mockSyncUseCase = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        syncedCount: 1,
        syncVersion: 1,
        serverTime: 12345,
        status: "IN_PROGRESS",
      }),
    ),
  };

  const mockViolationUseCase = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        strikeCount: 1,
        maxStrikes: 3,
        status: "IN_PROGRESS",
        isLocked: false,
      }),
    ),
  };

  const mockSubmitUseCase = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        status: "SUBMITTED",
        finishedAt: new Date().toISOString(),
        finalScore: 85,
        syncedToMoodle: false,
      }),
    ),
  };

  const service = new AttemptService(
    {} as unknown as AttemptRepositoryInterface,
    {} as unknown as ExamRepositoryInterface,
    {
      startAttemptUseCase: mockStartUseCase as unknown as StartAttemptUseCase,
      syncAnswerQueueUseCase:
        mockSyncUseCase as unknown as SyncAnswerQueueUseCase,
      recordViolationUseCase:
        mockViolationUseCase as unknown as RecordViolationUseCase,
      submitAttemptUseCase:
        mockSubmitUseCase as unknown as SubmitAttemptUseCase,
    },
  );

  it("should delegate startAttempt to startAttemptUseCase", async () => {
    const res = await service.startAttempt({
      examId: "exam-1",
      userId: "user-1",
      deviceHash: "dh",
      ipAddress: "127.0.0.1",
    });

    expect(res.isSuccess).toBe(true);
    expect(res.value.attemptId).toBe("att-1");
    expect(mockStartUseCase.execute).toHaveBeenCalled();
  });

  it("should delegate syncBatchAnswers to syncAnswerQueueUseCase", async () => {
    const res = await service.syncBatchAnswers({
      attemptId: "att-1",
      answers: [],
      syncVersion: 0,
    });

    expect(res.isSuccess).toBe(true);
    expect(res.value.syncedCount).toBe(1);
    expect(mockSyncUseCase.execute).toHaveBeenCalled();
  });

  it("should delegate recordViolation to recordViolationUseCase", async () => {
    const res = await service.recordViolation({
      attemptId: "att-1",
      eventType: "TAB_BLUR",
    });

    expect(res.isSuccess).toBe(true);
    expect(res.value.strikeCount).toBe(1);
    expect(mockViolationUseCase.execute).toHaveBeenCalled();
  });

  it("should delegate submitAttempt to submitAttemptUseCase", async () => {
    const res = await service.submitAttempt({
      attemptId: "att-1",
    });

    expect(res.isSuccess).toBe(true);
    expect(res.value.finalScore).toBe(85);
    expect(mockSubmitUseCase.execute).toHaveBeenCalled();
  });
});
