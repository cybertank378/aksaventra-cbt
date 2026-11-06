import type { AnswerValue } from "../dto/SyncBatchDTO";

export interface VaultRecord {
  attemptId: string | number;
  questionId: number;
  answer: AnswerValue;
  flagged: boolean;
  updatedAt: number;
  synced: boolean;
}

export interface LocalVaultInterface {
  saveAnswer(
    attemptId: string | number,
    questionId: number,
    answer: AnswerValue,
    flagged?: boolean,
  ): Promise<void>;

  getUnsyncedAnswers(attemptId: string | number): Promise<VaultRecord[]>;

  markAnswersAsSynced(
    attemptId: string | number,
    questionIds: number[],
  ): Promise<void>;

  getAllAnswers(attemptId: string | number): Promise<VaultRecord[]>;
}
