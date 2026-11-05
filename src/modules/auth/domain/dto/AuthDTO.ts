import type { UserRole } from "@/security/rbacConfig";

export interface UserSessionDTO {
  id: string;
  username: string;
  fullName: string;
  role: UserRole;
  className?: string | null;
  roomCode?: string | null;
}

export interface LoginInput {
  username: string;
  password: string;
  deviceHash?: string;
  ipAddress?: string;
  examId?: string;
}

export interface LoginOutput {
  token: string;
  user: UserSessionDTO;
  expiresInSeconds: number;
}

export interface VerifyExamTokenInput {
  examId: string;
  token: string;
}

export interface VerifyExamTokenOutput {
  isValid: boolean;
  examId: string;
  tokenExpiresAt: Date;
  remainingSeconds: number;
}

export interface ExchangeMoodleLaunchInput {
  moodleUserId: number;
  moodleCbtId: number;
  launchToken: string;
  deviceHash: string;
  ipAddress?: string;
}

export interface ExchangeMoodleLaunchOutput {
  token: string;
  user: UserSessionDTO;
  examId: string;
  attemptId: string;
}
