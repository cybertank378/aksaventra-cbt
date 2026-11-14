import { describe, expect, it, vi } from "vitest";
import { ExchangeMoodleLaunchTokenUseCase } from "@/modules/auth/application/usecases/ExchangeMoodleLaunchTokenUseCase";
import { UserSessionEntity } from "@/modules/auth/domain/entities/UserSessionEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthRepositoryInterface";
import type { JwtProvider } from "@/modules/auth/infrastructure/JwtProvider";

describe("ExchangeMoodleLaunchTokenUseCase", () => {
  const mockUser = new UserSessionEntity({
    id: "user-moodle-10",
    username: "moodle_student_10",
    fullName: "Moodle Student",
    role: "STUDENT",
    isActive: true,
  });

  const mockExam = {
    id: "exam-cbt-20",
    activeToken: "123456",
    tokenExpiresAt: new Date(Date.now() + 3600_000),
    moodleCbtId: 99,
  };

  const mockJwtProvider: JwtProvider = {
    signToken: vi.fn().mockResolvedValue("jwt-moodle-session-token"),
    verifyToken: vi.fn(),
  } as unknown as JwtProvider;

  const createMockRepo = (
    overrides?: Partial<AuthRepositoryInterface>,
  ): AuthRepositoryInterface => ({
    findUserByUsername: vi.fn(),
    findUserById: vi.fn(),
    findUserByMoodleId: vi.fn().mockResolvedValue(mockUser),
    verifyUserPassword: vi.fn(),
    findActiveAttempt: vi.fn().mockResolvedValue(null),
    findExamById: vi.fn(),
    findExamByMoodleCbtId: vi.fn().mockResolvedValue(mockExam),
    updateAttemptDeviceBinding: vi.fn(),
    createAttemptIfNotExists: vi
      .fn()
      .mockResolvedValue({ id: "attempt-new-1" }),
    validateMoodleLaunchToken: vi.fn().mockResolvedValue({
      moodleUserId: 10,
      username: "moodle_student_10",
      fullName: "Moodle Student",
      cbtId: 99,
    }),
    verifyMoodleCredentials: vi.fn().mockResolvedValue(null),
    syncMoodleUser: vi.fn().mockResolvedValue(mockUser),
    ensureExamExistsForMoodleCbt: vi.fn().mockResolvedValue(mockExam),
    ...overrides,
  });

  it("exchanges moodle launch token with explicit moodleUserId and provisions new attempt", async () => {
    const repo = createMockRepo();
    const useCase = new ExchangeMoodleLaunchTokenUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      moodleUserId: 10,
      moodleCbtId: 99,
      launchToken: "launch-token-abc",
      deviceHash: "device-hash-111",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.token).toBe("jwt-moodle-session-token");
    expect(result.value.attemptId).toBe("attempt-new-1");
    expect(result.value.examId).toBe("exam-cbt-20");
    expect(result.value.redirectUrl).toBe("/student/lobby/exam-cbt-20");
  });

  it("performs seamless SSO handshake without moodleUserId by validating launch token", async () => {
    const repo = createMockRepo({
      findUserByMoodleId: vi.fn().mockResolvedValue(null),
    });
    const useCase = new ExchangeMoodleLaunchTokenUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      moodleCbtId: 99,
      launchToken: "valid-secret-launch-token",
      deviceHash: "device-hash-fingerprint",
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.validateMoodleLaunchToken).toHaveBeenCalledWith(
      "valid-secret-launch-token",
    );
    expect(repo.syncMoodleUser).toHaveBeenCalledWith({
      moodleUserId: 10,
      username: "moodle_student_10",
      fullName: "Moodle Student",
      role: "STUDENT",
    });
    expect(result.value.redirectUrl).toBe("/student/lobby/exam-cbt-20");
  });

  it("rejects SSO handshake when launch token is invalid or expired", async () => {
    const repo = createMockRepo({
      findUserByMoodleId: vi.fn().mockResolvedValue(null),
      validateMoodleLaunchToken: vi.fn().mockResolvedValue(null),
    });
    const useCase = new ExchangeMoodleLaunchTokenUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      moodleCbtId: 99,
      launchToken: "expired-or-fake-token",
      deviceHash: "device-hash-fingerprint",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("INVALID_LAUNCH_TOKEN");
  });

  it("rejects exchange when moodle user does not exist", async () => {
    const repo = createMockRepo({
      findUserByMoodleId: vi.fn().mockResolvedValue(null),
      validateMoodleLaunchToken: vi.fn().mockResolvedValue(null),
    });
    const useCase = new ExchangeMoodleLaunchTokenUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      moodleUserId: 999,
      moodleCbtId: 99,
      launchToken: "launch-token-abc",
      deviceHash: "device-hash-111",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("INVALID_LAUNCH_TOKEN");
  });

  it("rejects exchange when moodle exam CBT module is missing", async () => {
    const repo = createMockRepo({
      findExamByMoodleCbtId: vi.fn().mockResolvedValue(null),
      ensureExamExistsForMoodleCbt: vi.fn().mockResolvedValue(null),
    });
    const useCase = new ExchangeMoodleLaunchTokenUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      moodleUserId: 10,
      moodleCbtId: 9999,
      launchToken: "launch-token-abc",
      deviceHash: "device-hash-111",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("EXAM_NOT_FOUND");
  });
});
