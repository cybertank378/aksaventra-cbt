import { describe, expect, it } from "vitest";
import type { ParticipantMonitorDTO } from "@/modules/proctor/domain/dto/ProctorActionDTO";

describe("Proctor Room Domain & Component Logic", () => {
  const mockParticipants: ParticipantMonitorDTO[] = [
    {
      attemptId: "att-1",
      userId: "u-1",
      username: "user01",
      fullName: "Siswa Satu",
      status: "IN_PROGRESS",
      isOnline: true,
      deviceHash: "dev-hash-1",
      ipAddress: "192.168.1.10",
      answeredCount: 20,
      totalQuestions: 40,
      progressPercentage: 50,
      strikeCount: 0,
      maxStrikes: 3,
      extraTimeSeconds: 0,
      remainingSeconds: 3600,
      startedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
      recentViolations: [],
    },
    {
      attemptId: "att-2",
      userId: "u-2",
      username: "user02",
      fullName: "Siswa Dua (Terkunci)",
      status: "LOCKED",
      isOnline: true,
      deviceHash: "dev-hash-2",
      ipAddress: "192.168.1.11",
      answeredCount: 15,
      totalQuestions: 40,
      progressPercentage: 37.5,
      strikeCount: 3,
      maxStrikes: 3,
      extraTimeSeconds: 0,
      remainingSeconds: 3000,
      startedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
      recentViolations: [
        {
          id: "v-1",
          eventType: "TAB_BLUR",
          createdAt: new Date().toISOString(),
        },
      ],
    },
    {
      attemptId: "att-3",
      userId: "u-3",
      username: "user03",
      fullName: "Siswa Tiga (Offline)",
      status: "IN_PROGRESS",
      isOnline: false,
      deviceHash: "dev-hash-3",
      ipAddress: "192.168.1.12",
      answeredCount: 10,
      totalQuestions: 40,
      progressPercentage: 25,
      strikeCount: 0,
      maxStrikes: 3,
      extraTimeSeconds: 0,
      remainingSeconds: 2000,
      startedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date(Date.now() - 120000).toISOString(),
      recentViolations: [],
    },
    {
      attemptId: "att-4",
      userId: "u-4",
      username: "user04",
      fullName: "Siswa Empat (Selesai)",
      status: "SUBMITTED",
      isOnline: false,
      deviceHash: "dev-hash-4",
      ipAddress: "192.168.1.13",
      answeredCount: 40,
      totalQuestions: 40,
      progressPercentage: 100,
      strikeCount: 0,
      maxStrikes: 3,
      extraTimeSeconds: 0,
      remainingSeconds: 0,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString(),
      lastHeartbeatAt: new Date().toISOString(),
      recentViolations: [],
    },
  ];

  it("calculates proctor statistic card aggregates accurately", () => {
    const total = mockParticipants.length;
    const inProgress = mockParticipants.filter(
      (p) => p.status === "IN_PROGRESS" && p.isOnline && p.strikeCount < 3,
    ).length;
    const locked = mockParticipants.filter(
      (p) => p.status === "LOCKED" || p.strikeCount >= 3,
    ).length;
    const offline = mockParticipants.filter(
      (p) => p.status === "IN_PROGRESS" && !p.isOnline,
    ).length;
    const submitted = mockParticipants.filter(
      (p) => p.status === "SUBMITTED",
    ).length;

    expect(total).toBe(4);
    expect(inProgress).toBe(1);
    expect(locked).toBe(1);
    expect(offline).toBe(1);
    expect(submitted).toBe(1);
  });

  it("evaluates student lock detection based on status and strike threshold", () => {
    const isLockedParticipant = (p: ParticipantMonitorDTO) =>
      p.status === "LOCKED" || p.strikeCount >= 3;

    expect(isLockedParticipant(mockParticipants[0])).toBe(false);
    expect(isLockedParticipant(mockParticipants[1])).toBe(true);
    expect(isLockedParticipant(mockParticipants[2])).toBe(false);
  });

  it("evaluates student offline status based on connection state", () => {
    const isOfflineActive = (p: ParticipantMonitorDTO) =>
      p.status === "IN_PROGRESS" && !p.isOnline;

    expect(isOfflineActive(mockParticipants[0])).toBe(false);
    expect(isOfflineActive(mockParticipants[1])).toBe(false);
    expect(isOfflineActive(mockParticipants[2])).toBe(true);
  });

  it("correctly formats countdown timer for token validity", () => {
    const formatTokenCountdown = (seconds: number) => {
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    };

    expect(formatTokenCountdown(125)).toBe("2m 05s");
    expect(formatTokenCountdown(600)).toBe("10m 00s");
    expect(formatTokenCountdown(45)).toBe("0m 45s");
  });

  it("formats remaining minutes with extra proctor time correctly", () => {
    const formatRemainingWithBonus = (
      baseSeconds: number,
      extraSeconds: number,
    ) => {
      const totalSecs = baseSeconds + extraSeconds;
      const mins = Math.floor(totalSecs / 60);
      const secs = totalSecs % 60;
      return `${mins}m ${secs < 10 ? "0" : ""}${secs}s`;
    };

    // 10 minutes remaining + 5 minutes extra proctor time = 15 minutes
    expect(formatRemainingWithBonus(600, 300)).toBe("15m 00s");
  });
});

