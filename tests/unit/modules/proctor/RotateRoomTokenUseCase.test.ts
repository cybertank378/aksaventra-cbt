import { describe, expect, it, vi } from "vitest";
import {
  generateBase32Token,
  RotateRoomTokenUseCase,
} from "@/modules/proctor/application/usecases/RotateRoomTokenUseCase";
import type { ProctorRepositoryInterface } from "@/modules/proctor/domain/interfaces/ProctorRepositoryInterface";

describe("RotateRoomTokenUseCase", () => {
  const mockRepo = {
    getExamMetadata: vi.fn().mockResolvedValue({
      id: "exam-1",
      activeToken: "OLD123",
      tokenExpiresAt: new Date(),
      durationSeconds: 7200,
      maxStrikes: 3,
      answerKeysJson: {},
    }),
    getRoomParticipants: vi.fn(),
    updateExamToken: vi.fn().mockResolvedValue(undefined),
    unlockAttempt: vi.fn(),
    resetDeviceBinding: vi.fn(),
    extendAttemptTime: vi.fn(),
    forceSubmitAttempt: vi.fn(),
  } as unknown as ProctorRepositoryInterface;

  it("should generate a 6-character Base32 token and update exam", async () => {
    const useCase = new RotateRoomTokenUseCase(mockRepo);
    const result = await useCase.execute({ examId: "exam-1" });

    expect(result.isSuccess).toBe(true);
    expect(result.value.token).toHaveLength(6);
    expect(mockRepo.updateExamToken).toHaveBeenCalledWith(
      "exam-1",
      result.value.token,
      expect.any(Date),
    );
  });

  it("should accept manual override token", async () => {
    const useCase = new RotateRoomTokenUseCase(mockRepo);
    const result = await useCase.execute({
      examId: "exam-1",
      manualToken: "custom99",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.token).toBe("CUSTOM99");
    expect(mockRepo.updateExamToken).toHaveBeenCalledWith(
      "exam-1",
      "CUSTOM99",
      expect.any(Date),
    );
  });

  it("generateBase32Token should not contain ambiguous chars like 0, 1, O, I", () => {
    const token = generateBase32Token(100);
    expect(token).not.toMatch(/[01OI]/);
  });
});
