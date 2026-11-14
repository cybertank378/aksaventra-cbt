import { describe, expect, it, vi } from "vitest";
import { SubmitAttemptUseCase } from "@/modules/attempts/application/usecases/SubmitAttemptUseCase";
import { AnswerRecordEntity } from "@/modules/attempts/domain/entities/AnswerRecordEntity";
import { AttemptSessionEntity } from "@/modules/attempts/domain/entities/AttemptSessionEntity";
import type { AttemptRepositoryInterface } from "@/modules/attempts/domain/interfaces/AttemptRepositoryInterface";
import type { ExamRepositoryInterface } from "@/modules/exams/domain/interfaces/ExamRepositoryInterface";

describe("SubmitAttemptUseCase", () => {
  const mockAttempt = new AttemptSessionEntity({
    id: "attempt-1",
    examId: "exam-1",
    userId: "user-1",
    status: "IN_PROGRESS",
    startedAt: new Date(),
    extraTimeSeconds: 0,
    strikeCount: 0,
    maxStrikes: 3,
    deviceHash: "hash-1",
    ipAddress: "127.0.0.1",
    questionOrder: [1, 2, 3, 4],
    answers: new Map<number, AnswerRecordEntity>([
      [
        1,
        new AnswerRecordEntity({
          questionId: 1,
          answer: "A",
          flagged: false,
          updatedAt: 1000,
        }),
      ],
      [
        2,
        new AnswerRecordEntity({
          questionId: 2,
          answer: "C",
          flagged: false,
          updatedAt: 1000,
        }),
      ],
      [
        3,
        new AnswerRecordEntity({
          questionId: 3,
          answer: "B",
          flagged: false,
          updatedAt: 1000,
        }),
      ],
      [
        4,
        new AnswerRecordEntity({
          questionId: 4,
          answer: "D",
          flagged: false,
          updatedAt: 1000,
        }),
      ],
    ]),
    syncVersion: 1,
    syncedToMoodle: false,
    lastHeartbeatAt: new Date(),
  });

  const mockAttemptRepo = {
    findById: vi.fn().mockResolvedValue(mockAttempt),
    findByExamAndUser: vi.fn(),
    findAll: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
    syncBatchAnswers: vi.fn(),
    recordViolation: vi.fn(),
    submitAttempt: vi.fn().mockResolvedValue(undefined),
  } as unknown as AttemptRepositoryInterface;

  const mockExamRepo = {
    findById: vi.fn(),
    findAll: vi.fn(),
    findByMoodleCbtId: vi.fn(),
    getAnswerKeys: vi.fn().mockResolvedValue({
      "1": "A",
      "2": "B",
      "3": "B",
      "4": "D",
    }),
    updateRoomToken: vi.fn(),
    updateExamMetadata: vi.fn(),
    save: vi.fn(),
    delete: vi.fn(),
  } as unknown as ExamRepositoryInterface;

  it("should calculate correct score (3/4 = 75%) and submit attempt", async () => {
    const useCase = new SubmitAttemptUseCase(mockAttemptRepo, mockExamRepo);

    const result = await useCase.execute({
      attemptId: "attempt-1",
    });

    expect(result.isSuccess).toBe(true);
    const data = result.value;
    expect(data.status).toBe("SUBMITTED");
    expect(data.finalScore).toBe(75);
    expect(mockAttemptRepo.submitAttempt).toHaveBeenCalledWith(
      "attempt-1",
      75,
      expect.any(Date),
    );
  });

  it("should fail with conflict if attempt is already submitted", async () => {
    const submittedAttempt = new AttemptSessionEntity({
      ...mockAttempt,
      id: "attempt-2",
      status: "SUBMITTED",
      answers: new Map(),
    });

    const repo = {
      ...mockAttemptRepo,
      findById: vi.fn().mockResolvedValue(submittedAttempt),
    } as unknown as AttemptRepositoryInterface;

    const useCase = new SubmitAttemptUseCase(repo, mockExamRepo);
    const result = await useCase.execute({ attemptId: "attempt-2" });

    expect(result.isSuccess).toBe(false);
    expect(result.error.statusCode).toBe(409);
  });
});
