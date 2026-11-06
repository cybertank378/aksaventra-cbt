import { describe, expect, it, vi } from "vitest";
import { GetRoomParticipantsUseCase } from "@/modules/proctor/application/usecases/GetRoomParticipantsUseCase";
import { ParticipantMonitorEntity } from "@/modules/proctor/domain/entities/ParticipantMonitorEntity";
import type { ProctorRepositoryInterface } from "@/modules/proctor/domain/interfaces/ProctorRepositoryInterface";

describe("GetRoomParticipantsUseCase", () => {
  const now = new Date();
  const onlineParticipant = new ParticipantMonitorEntity({
    attemptId: "att-online",
    userId: "u-1",
    username: "student1",
    fullName: "Ahmad Dahlan",
    className: "X-RPL-1",
    roomCode: "LAB-1",
    status: "IN_PROGRESS",
    deviceHash: "dh1",
    ipAddress: "192.168.1.10",
    answeredCount: 15,
    totalQuestions: 20,
    strikeCount: 1,
    maxStrikes: 3,
    durationSeconds: 7200,
    extraTimeSeconds: 0,
    startedAt: new Date(now.getTime() - 1800 * 1000), // 30 min ago
    lastHeartbeatAt: new Date(now.getTime() - 10 * 1000), // 10s ago -> ONLINE
  });

  const offlineParticipant = new ParticipantMonitorEntity({
    attemptId: "att-offline",
    userId: "u-2",
    username: "student2",
    fullName: "Budi Santoso",
    className: "X-RPL-1",
    roomCode: "LAB-1",
    status: "LOCKED",
    deviceHash: "dh2",
    ipAddress: "192.168.1.11",
    answeredCount: 5,
    totalQuestions: 20,
    strikeCount: 3,
    maxStrikes: 3,
    durationSeconds: 7200,
    extraTimeSeconds: 0,
    startedAt: new Date(now.getTime() - 2000 * 1000),
    lastHeartbeatAt: new Date(now.getTime() - 120 * 1000), // 120s ago -> OFFLINE
  });

  const mockRepo = {
    getExamMetadata: vi.fn().mockResolvedValue({
      id: "exam-1",
      activeToken: "ABC234",
      tokenExpiresAt: new Date(now.getTime() + 900 * 1000),
      durationSeconds: 7200,
      maxStrikes: 3,
      answerKeysJson: {},
    }),
    getRoomParticipants: vi
      .fn()
      .mockResolvedValue([onlineParticipant, offlineParticipant]),
    updateExamToken: vi.fn(),
    unlockAttempt: vi.fn(),
    resetDeviceBinding: vi.fn(),
    extendAttemptTime: vi.fn(),
    forceSubmitAttempt: vi.fn(),
  } as unknown as ProctorRepositoryInterface;

  it("should return participant matrix, calculate online/offline status, and aggregate counts", async () => {
    const useCase = new GetRoomParticipantsUseCase(mockRepo);
    const result = await useCase.execute({ examId: "exam-1" });

    expect(result.isSuccess).toBe(true);
    const data = result.value;

    expect(data.totalParticipants).toBe(2);
    expect(data.onlineCount).toBe(1);
    expect(data.lockedCount).toBe(1);
    expect(data.activeToken).toBe("ABC234");

    const pOnline = data.participants.find((p) => p.attemptId === "att-online");
    expect(pOnline?.isOnline).toBe(true);
    expect(pOnline?.progressPercentage).toBe(75);

    const pOffline = data.participants.find(
      (p) => p.attemptId === "att-offline",
    );
    expect(pOffline?.isOnline).toBe(false);
    expect(pOffline?.progressPercentage).toBe(25);
  });
});
