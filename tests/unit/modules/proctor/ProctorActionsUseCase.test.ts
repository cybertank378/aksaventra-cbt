import { describe, expect, it, vi } from "vitest";
import { ExtendParticipantTimeUseCase } from "@/modules/proctor/application/usecases/ExtendParticipantTimeUseCase";
import { ForceSubmitAttemptUseCase } from "@/modules/proctor/application/usecases/ForceSubmitAttemptUseCase";
import { ResetDeviceBindingUseCase } from "@/modules/proctor/application/usecases/ResetDeviceBindingUseCase";
import { UnlockParticipantStrikeUseCase } from "@/modules/proctor/application/usecases/UnlockParticipantStrikeUseCase";
import type { ProctorRepositoryInterface } from "@/modules/proctor/domain/interfaces/ProctorRepositoryInterface";

describe("Proctor Actions Use Cases", () => {
  const mockRepo = {
    getRoomParticipants: vi.fn(),
    getExamMetadata: vi.fn().mockResolvedValue({
      id: "exam-1",
      activeToken: "ABCDEF",
      tokenExpiresAt: new Date(),
      durationSeconds: 7200,
      maxStrikes: 3,
      answerKeysJson: { "1": "A" },
    }),
    updateExamToken: vi.fn(),
    unlockAttempt: vi.fn().mockResolvedValue(true),
    resetDeviceBinding: vi.fn().mockResolvedValue(true),
    extendAttemptTime: vi.fn().mockResolvedValue({ extraTimeSeconds: 600 }),
    forceSubmitAttempt: vi.fn().mockResolvedValue(true),
  } as unknown as ProctorRepositoryInterface;

  it("should unlock participant, reset strikes to 0, and return success", async () => {
    const useCase = new UnlockParticipantStrikeUseCase(mockRepo);
    const result = await useCase.execute({
      attemptId: "att-1",
      proctorId: "proctor-admin",
      reason: "False alarm in computer lab",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.action).toBe("unlock");
    expect(result.value.status).toBe("IN_PROGRESS");
    expect(result.value.strikeCount).toBe(0);
    expect(mockRepo.unlockAttempt).toHaveBeenCalledWith(
      "att-1",
      "proctor-admin",
      "False alarm in computer lab",
    );
  });

  it("should reset device binding for student attempt", async () => {
    const useCase = new ResetDeviceBindingUseCase(mockRepo);
    const result = await useCase.execute({
      attemptId: "att-1",
      proctorId: "proctor-admin",
      reason: "Laptop battery drained, switching to desktop",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.action).toBe("reset_device");
    expect(mockRepo.resetDeviceBinding).toHaveBeenCalledWith(
      "att-1",
      "proctor-admin",
      "Laptop battery drained, switching to desktop",
    );
  });

  it("should extend participant attempt time", async () => {
    const useCase = new ExtendParticipantTimeUseCase(mockRepo);
    const result = await useCase.execute({
      attemptId: "att-1",
      extendMinutes: 10,
      proctorId: "proctor-admin",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.action).toBe("extend_time");
    expect(result.value.extraTimeSeconds).toBe(600);
    expect(mockRepo.extendAttemptTime).toHaveBeenCalledWith(
      "att-1",
      600,
      "proctor-admin",
      undefined,
    );
  });

  it("should force submit attempt", async () => {
    const useCase = new ForceSubmitAttemptUseCase(mockRepo);
    const result = await useCase.execute({
      attemptId: "att-1",
      examId: "exam-1",
      proctorId: "proctor-admin",
      reason: "Student finished early",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.action).toBe("force_submit");
    expect(result.value.status).toBe("SUBMITTED");
    expect(mockRepo.forceSubmitAttempt).toHaveBeenCalled();
  });
});
