import { describe, expect, it, vi } from "vitest";
import { VerifyExamTokenUseCase } from "@/modules/auth/application/usecases/VerifyExamTokenUseCase";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthRepositoryInterface";

describe("VerifyExamTokenUseCase", () => {
  const mockExam = {
    id: "exam-uuid-123",
    activeToken: "XYZ789",
    tokenExpiresAt: new Date(Date.now() + 600_000), // Valid for 10 minutes
    moodleCbtId: 101,
  };

  const createMockRepo = (
    overrides?: Partial<AuthRepositoryInterface>,
  ): AuthRepositoryInterface => ({
    findUserByUsername: vi.fn(),
    findUserById: vi.fn(),
    findUserByMoodleId: vi.fn(),
    verifyUserPassword: vi.fn(),
    findActiveAttempt: vi.fn(),
    findExamById: vi.fn().mockResolvedValue(mockExam),
    findExamByMoodleCbtId: vi.fn(),
    updateAttemptDeviceBinding: vi.fn(),
    createAttemptIfNotExists: vi.fn(),
    ...overrides,
  });

  it("verifies valid 6-digit exam room token successfully", async () => {
    const repo = createMockRepo();
    const useCase = new VerifyExamTokenUseCase(repo);

    const result = await useCase.execute({
      examId: "exam-uuid-123",
      token: "xyz789", // Case-insensitive test
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.isValid).toBe(true);
    expect(result.value.remainingSeconds).toBeGreaterThan(0);
  });

  it("rejects incorrect exam room token with INVALID_EXAM_TOKEN", async () => {
    const repo = createMockRepo();
    const useCase = new VerifyExamTokenUseCase(repo);

    const result = await useCase.execute({
      examId: "exam-uuid-123",
      token: "WRONG9",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("INVALID_EXAM_TOKEN");
  });

  it("rejects expired exam token with EXAM_TOKEN_EXPIRED", async () => {
    const expiredExam = {
      ...mockExam,
      tokenExpiresAt: new Date(Date.now() - 60_000), // Expired 1 minute ago
    };

    const repo = createMockRepo({
      findExamById: vi.fn().mockResolvedValue(expiredExam),
    });
    const useCase = new VerifyExamTokenUseCase(repo);

    const result = await useCase.execute({
      examId: "exam-uuid-123",
      token: "XYZ789",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_TOKEN_EXPIRED");
  });

  it("returns EXAM_NOT_FOUND when exam ID does not exist", async () => {
    const repo = createMockRepo({
      findExamById: vi.fn().mockResolvedValue(null),
    });
    const useCase = new VerifyExamTokenUseCase(repo);

    const result = await useCase.execute({
      examId: "missing-exam",
      token: "XYZ789",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_NOT_FOUND");
  });
});
