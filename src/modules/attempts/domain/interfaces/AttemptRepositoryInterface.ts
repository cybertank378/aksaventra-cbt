import type { AttemptStatus } from "@prisma/client";
import type { BaseRepository } from "@/core/base/BaseRepository";
import type { AnswerRecordEntity } from "../entities/AnswerRecordEntity";
import type { AttemptSessionEntity } from "../entities/AttemptSessionEntity";
import type { SecurityStrikeEntity } from "../entities/SecurityStrikeEntity";

export interface BatchSyncResult {
  success: boolean;
  syncVersion: number;
  currentStatus: AttemptStatus;
  syncedCount: number;
}

export interface AttemptRepositoryInterface
  extends BaseRepository<AttemptSessionEntity, string> {
  findByExamAndUser(
    examId: string,
    userId: string,
  ): Promise<AttemptSessionEntity | null>;

  syncBatchAnswers(
    attemptId: string,
    answers: AnswerRecordEntity[],
    expectedSyncVersion: number,
  ): Promise<BatchSyncResult>;

  recordViolation(
    attemptId: string,
    violation: SecurityStrikeEntity,
    newStrikeCount: number,
    shouldLock: boolean,
  ): Promise<void>;

  submitAttempt(
    attemptId: string,
    finalScore: number,
    finishedAt: Date,
  ): Promise<void>;
}
