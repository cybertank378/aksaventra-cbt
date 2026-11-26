import { describe, expect, it, vi } from "vitest";
import { LoginUseCase } from "@/modules/auth/application/usecases/LoginUseCase";
import { UserSessionEntity } from "@/modules/auth/domain/entities/UserSessionEntity";
import type { AuthRepositoryInterface } from "@/modules/auth/domain/interfaces/AuthRepositoryInterface";
import type { JwtProvider } from "@/modules/auth/infrastructure/JwtProvider";

describe("LoginUseCase", () => {
  const mockStudent = new UserSessionEntity({
    id: "user-std-1",
    username: "siswa_01",
    fullName: "Budi Santoso",
    role: "STUDENT",
    className: "XII-IPA-1",
    roomCode: "LAB-01",
    isActive: true,
  });

  const mockAdmin = new UserSessionEntity({
    id: "user-admin-1",
    username: "admin",
    fullName: "Admin Administrator",
    role: "ADMIN",
    isActive: true,
  });

  const mockJwtProvider: JwtProvider = {
    signToken: vi.fn().mockResolvedValue("mock-jwt-token-xyz"),
    verifyToken: vi.fn(),
  } as unknown as JwtProvider;

  const createMockRepo = (
    overrides?: Partial<AuthRepositoryInterface>,
  ): AuthRepositoryInterface => ({
    findUserByUsername: vi.fn().mockResolvedValue(mockStudent),
    findUserById: vi.fn(),
    findUserByMoodleId: vi.fn(),
    verifyUserPassword: vi.fn().mockResolvedValue(true),
    findActiveAttempt: vi.fn().mockResolvedValue(null),
    findExamById: vi.fn(),
    findExamByMoodleCbtId: vi.fn(),
    updateAttemptDeviceBinding: vi.fn(),
    createAttemptIfNotExists: vi.fn(),
    validateMoodleLaunchToken: vi.fn().mockResolvedValue(null),
    verifyMoodleCredentials: vi.fn().mockResolvedValue(null),
    syncMoodleUser: vi.fn().mockImplementation(async (params) => {
      return new UserSessionEntity({
        id: `synced-${params.username}`,
        username: params.username,
        fullName: params.fullName,
        role: params.role || "STUDENT",
        isActive: true,
      });
    }),
    ensureExamExistsForMoodleCbt: vi.fn(),
    ...overrides,
  });

  it("logs in successfully with local credentials and returns JWT token", async () => {
    const repo = createMockRepo();
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "siswa_01",
      password: "password123",
      deviceHash: "hash-device-laptop",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.token).toBe("mock-jwt-token-xyz");
    expect(result.value.user.username).toBe("siswa_01");
    expect(result.value.user.role).toBe("STUDENT");
    expect(result.value.redirectUrl).toBe("/student/lobby");
  });

  it("authenticates admin via Moodle /login/token.php and core_webservice_get_site_info", async () => {
    const repo = createMockRepo({
      verifyMoodleCredentials: vi.fn().mockResolvedValue({
        token: "moodle-wstoken-admin-123",
        moodleUserId: 2,
        username: "admin",
        fullName: "Administrator Sekolah",
        role: "ADMIN",
      }),
      syncMoodleUser: vi.fn().mockResolvedValue(mockAdmin),
    });
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "admin",
      password: "AdminPassword123!",
    });

    expect(result.isSuccess).toBe(true);
    expect(repo.verifyMoodleCredentials).toHaveBeenCalledWith(
      "admin",
      "AdminPassword123!",
    );
    expect(result.value.user.role).toBe("ADMIN");
    expect(result.value.redirectUrl).toBe("/dashboard");
  });

  it("rejects login when credentials fail both in Moodle and local database", async () => {
    const repo = createMockRepo({
      verifyMoodleCredentials: vi.fn().mockResolvedValue(null),
      findUserByUsername: vi.fn().mockResolvedValue(null),
    });
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "unknown_user",
      password: "password123",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("rejects login when password verification fails locally", async () => {
    const repo = createMockRepo({
      verifyMoodleCredentials: vi.fn().mockResolvedValue(null),
      verifyUserPassword: vi.fn().mockResolvedValue(false),
    });
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "siswa_01",
      password: "wrong_password",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("allows student login from a different device without device-binding block and updates metadata", async () => {
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      findActiveAttempt: vi.fn().mockResolvedValue({
        id: "attempt-100",
        examId: "exam-50",
        deviceHash: "original-device-hash-1",
        status: "IN_PROGRESS",
      }),
      updateAttemptDeviceBinding: updateSpy,
    });
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "siswa_01",
      password: "password123",
      deviceHash: "different-device-hash-2",
      examId: "exam-50",
    });

    expect(result.isSuccess).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      "attempt-100",
      "different-device-hash-2",
      undefined,
    );
  });

  it("binds device on first login when previous deviceHash is empty", async () => {
    const updateSpy = vi.fn().mockResolvedValue(undefined);
    const repo = createMockRepo({
      findActiveAttempt: vi.fn().mockResolvedValue({
        id: "attempt-100",
        examId: "exam-50",
        deviceHash: "",
        status: "IN_PROGRESS",
      }),
      updateAttemptDeviceBinding: updateSpy,
    });
    const useCase = new LoginUseCase(repo, mockJwtProvider);

    const result = await useCase.execute({
      username: "siswa_01",
      password: "password123",
      deviceHash: "new-first-device-hash",
      examId: "exam-50",
    });

    expect(result.isSuccess).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith(
      "attempt-100",
      "new-first-device-hash",
      undefined,
    );
  });
});
