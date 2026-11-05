import type { UserSessionEntity } from "../entities/UserSessionEntity";

export interface ActiveAttemptInfo {
  id: string;
  examId: string;
  deviceHash: string;
  status: string;
}

export interface ExamTokenInfo {
  id: string;
  activeToken: string;
  tokenExpiresAt: Date;
  moodleCbtId: number;
}

export interface AuthRepositoryInterface {
  findUserByUsername(username: string): Promise<UserSessionEntity | null>;
  findUserById(id: string): Promise<UserSessionEntity | null>;
  findUserByMoodleId(moodleUserId: number): Promise<UserSessionEntity | null>;
  verifyUserPassword(
    userId: string,
    plainTextPassword: string,
  ): Promise<boolean>;
  findActiveAttempt(
    userId: string,
    examId?: string,
  ): Promise<ActiveAttemptInfo | null>;
  findExamById(examId: string): Promise<ExamTokenInfo | null>;
  findExamByMoodleCbtId(moodleCbtId: number): Promise<ExamTokenInfo | null>;
  updateAttemptDeviceBinding(
    attemptId: string,
    deviceHash: string,
    ipAddress?: string,
  ): Promise<void>;
  createAttemptIfNotExists(params: {
    examId: string;
    userId: string;
    deviceHash: string;
    ipAddress: string;
  }): Promise<{ id: string }>;
}
