import type { AttemptStatus, ViolationEventType } from "@prisma/client";

export type AnswerValue =
  | string
  | string[]
  | Record<string, string>
  | boolean
  | number
  | null;

export interface AnswerItemDTO {
  questionId: number;
  ans: AnswerValue;
  flag: boolean;
  ts: number;
}

export interface SyncBatchRequestDTO {
  attemptId: string;
  answers: AnswerItemDTO[];
  syncVersion: number;
}

export interface SyncBatchResponseDTO {
  syncedCount: number;
  syncVersion: number;
  serverTime: number;
  status: AttemptStatus;
}

export interface StartAttemptInputDTO {
  examId: string;
  userId: string;
  deviceHash: string;
  ipAddress: string;
  roomToken?: string;
}

export interface StartAttemptResponseDTO {
  attemptId: string;
  examId: string;
  userId: string;
  status: AttemptStatus;
  startedAt: string;
  durationSeconds: number;
  extraTimeSeconds: number;
  maxStrikes: number;
  strikeCount: number;
  questionOrder: number[];
  answers: Record<string, AnswerItemDTO>;
  syncVersion: number;
}

export interface RecordViolationInputDTO {
  attemptId: string;
  eventType: ViolationEventType;
  durationMs?: number;
  details?: Record<string, unknown>;
}

export interface RecordViolationResponseDTO {
  attemptId: string;
  strikeCount: number;
  maxStrikes: number;
  status: AttemptStatus;
  isLocked: boolean;
  message?: string;
}

export interface SubmitAttemptInputDTO {
  attemptId: string;
  finalAnswers?: AnswerItemDTO[];
}

export interface SubmitAttemptResponseDTO {
  attemptId: string;
  status: AttemptStatus;
  finishedAt: string;
  finalScore: number;
  syncedToMoodle: boolean;
}
