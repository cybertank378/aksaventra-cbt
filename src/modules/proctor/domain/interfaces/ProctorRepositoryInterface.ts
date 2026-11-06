import type { AttemptStatus } from "@prisma/client";
import type { ParticipantMonitorEntity } from "../entities/ParticipantMonitorEntity";

export interface ProctorExamMeta {
  id: string;
  activeToken: string;
  tokenExpiresAt: Date;
  durationSeconds: number;
  maxStrikes: number;
  answerKeysJson: Record<string, string>;
}

export interface ProctorRepositoryInterface {
  getRoomParticipants(
    examId: string,
    roomCode?: string,
    status?: AttemptStatus,
  ): Promise<ParticipantMonitorEntity[]>;

  getExamMetadata(examId: string): Promise<ProctorExamMeta | null>;

  updateExamToken(
    examId: string,
    token: string,
    expiresAt: Date,
  ): Promise<void>;

  unlockAttempt(
    attemptId: string,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean>;

  resetDeviceBinding(
    attemptId: string,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean>;

  extendAttemptTime(
    attemptId: string,
    additionalSeconds: number,
    proctorId?: string,
    reason?: string,
  ): Promise<{ extraTimeSeconds: number } | null>;

  forceSubmitAttempt(
    attemptId: string,
    finalScore: number,
    proctorId?: string,
    reason?: string,
  ): Promise<boolean>;
}
