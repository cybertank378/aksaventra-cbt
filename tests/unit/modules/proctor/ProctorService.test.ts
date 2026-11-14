import { describe, expect, it, vi } from "vitest";
import { Result } from "@/core/domain/Result";
import { ProctorService } from "@/modules/proctor/application/service/ProctorService";
import type { ExtendParticipantTimeUseCase } from "@/modules/proctor/application/usecases/ExtendParticipantTimeUseCase";
import type { ForceSubmitAttemptUseCase } from "@/modules/proctor/application/usecases/ForceSubmitAttemptUseCase";
import type { GetRoomParticipantsUseCase } from "@/modules/proctor/application/usecases/GetRoomParticipantsUseCase";
import type { ResetDeviceBindingUseCase } from "@/modules/proctor/application/usecases/ResetDeviceBindingUseCase";
import type { RotateRoomTokenUseCase } from "@/modules/proctor/application/usecases/RotateRoomTokenUseCase";
import type { UnlockParticipantStrikeUseCase } from "@/modules/proctor/application/usecases/UnlockParticipantStrikeUseCase";
import type { ProctorRepositoryInterface } from "@/modules/proctor/domain/interfaces/ProctorRepositoryInterface";

describe("ProctorService", () => {
  const mockGetParticipants = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        examId: "exam-1",
        activeToken: "ABCDEF",
        tokenExpiresAt: new Date().toISOString(),
        totalParticipants: 1,
        onlineCount: 1,
        lockedCount: 0,
        submittedCount: 0,
        participants: [],
      }),
    ),
  };

  const mockRotateToken = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        examId: "exam-1",
        token: "NEW123",
        expiresAt: new Date().toISOString(),
      }),
    ),
  };

  const mockUnlock = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        action: "unlock",
        success: true,
        status: "IN_PROGRESS",
        strikeCount: 0,
        message: "Unlocked",
      }),
    ),
  };

  const mockReset = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        action: "reset_device",
        success: true,
        status: "IN_PROGRESS",
        strikeCount: 0,
        message: "Reset",
      }),
    ),
  };

  const mockExtend = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        action: "extend_time",
        success: true,
        status: "IN_PROGRESS",
        strikeCount: 0,
        extraTimeSeconds: 600,
        message: "Extended",
      }),
    ),
  };

  const mockForceSubmit = {
    execute: vi.fn().mockResolvedValue(
      Result.ok({
        attemptId: "att-1",
        action: "force_submit",
        success: true,
        status: "SUBMITTED",
        strikeCount: 0,
        message: "Submitted",
      }),
    ),
  };

  const service = new ProctorService(
    {} as unknown as ProctorRepositoryInterface,
    {
      getRoomParticipantsUseCase:
        mockGetParticipants as unknown as GetRoomParticipantsUseCase,
      rotateRoomTokenUseCase:
        mockRotateToken as unknown as RotateRoomTokenUseCase,
      unlockParticipantStrikeUseCase:
        mockUnlock as unknown as UnlockParticipantStrikeUseCase,
      resetDeviceBindingUseCase:
        mockReset as unknown as ResetDeviceBindingUseCase,
      extendParticipantTimeUseCase:
        mockExtend as unknown as ExtendParticipantTimeUseCase,
      forceSubmitAttemptUseCase:
        mockForceSubmit as unknown as ForceSubmitAttemptUseCase,
    },
  );

  it("should delegate getRoomParticipants to its usecase", async () => {
    const res = await service.getRoomParticipants({ examId: "exam-1" });
    expect(res.isSuccess).toBe(true);
    expect(mockGetParticipants.execute).toHaveBeenCalled();
  });

  it("should delegate rotateRoomToken to its usecase", async () => {
    const res = await service.rotateRoomToken({ examId: "exam-1" });
    expect(res.isSuccess).toBe(true);
    expect(res.value.token).toBe("NEW123");
    expect(mockRotateToken.execute).toHaveBeenCalled();
  });

  it("should delegate unlockParticipant to its usecase", async () => {
    const res = await service.unlockParticipant({ attemptId: "att-1" });
    expect(res.isSuccess).toBe(true);
    expect(mockUnlock.execute).toHaveBeenCalled();
  });

  it("should delegate resetDeviceBinding to its usecase", async () => {
    const res = await service.resetDeviceBinding({ attemptId: "att-1" });
    expect(res.isSuccess).toBe(true);
    expect(mockReset.execute).toHaveBeenCalled();
  });

  it("should delegate extendParticipantTime to its usecase", async () => {
    const res = await service.extendParticipantTime({
      attemptId: "att-1",
      extendMinutes: 10,
    });
    expect(res.isSuccess).toBe(true);
    expect(mockExtend.execute).toHaveBeenCalled();
  });

  it("should delegate forceSubmitAttempt to its usecase", async () => {
    const res = await service.forceSubmitAttempt({
      attemptId: "att-1",
      examId: "exam-1",
    });
    expect(res.isSuccess).toBe(true);
    expect(mockForceSubmit.execute).toHaveBeenCalled();
  });
});
