import type { AttemptStatus, ViolationEventType } from "@prisma/client";

export type ProctorActionType =
  | "unlock"
  | "reset_device"
  | "extend_time"
  | "force_submit";

export interface ParticipantMonitorDTO {
  attemptId: string;
  userId: string;
  username: string;
  fullName: string;
  className?: string | null;
  roomCode?: string | null;
  status: AttemptStatus;
  isOnline: boolean;
  deviceHash: string;
  ipAddress: string;
  answeredCount: number;
  totalQuestions: number;
  progressPercentage: number;
  strikeCount: number;
  maxStrikes: number;
  extraTimeSeconds: number;
  remainingSeconds: number;
  startedAt: string;
  finishedAt?: string | null;
  lastHeartbeatAt: string;
  recentViolations: Array<{
    id: string;
    eventType: ViolationEventType;
    createdAt: string;
    details?: Record<string, unknown> | null;
  }>;
}

export interface GetRoomParticipantsQueryDTO {
  examId: string;
  roomCode?: string;
  status?: AttemptStatus;
}

export interface GetRoomParticipantsResponseDTO {
  examId: string;
  activeToken: string;
  tokenExpiresAt: string;
  totalParticipants: number;
  onlineCount: number;
  lockedCount: number;
  submittedCount: number;
  participants: ParticipantMonitorDTO[];
}

export interface RotateRoomTokenInputDTO {
  examId: string;
  manualToken?: string;
  expiresInSeconds?: number;
}

export interface RotateRoomTokenResponseDTO {
  examId: string;
  token: string;
  expiresAt: string;
}

export interface ProctorActionInputDTO {
  examId: string;
  attemptId: string;
  action: ProctorActionType;
  proctorId?: string;
  reason?: string;
  extendMinutes?: number;
}

export interface ProctorActionResponseDTO {
  attemptId: string;
  action: ProctorActionType;
  success: boolean;
  status: AttemptStatus;
  strikeCount: number;
  extraTimeSeconds?: number;
  message: string;
}
