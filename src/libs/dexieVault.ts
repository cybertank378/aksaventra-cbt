import Dexie, { type Table } from "dexie";

export interface VaultAnswerRecord {
  id?: string; // composite key: `${attemptId}:${questionId}`
  attemptId: string | number;
  questionId: number;
  answer: string | string[] | Record<string, string> | boolean | number | null;
  flagged: boolean;
  updatedAt: number;
  synced: boolean;
}

export interface VaultAttemptMeta {
  attemptId: string | number;
  examId: string | number;
  timeStart: number;
  durationSeconds: number;
  extraTimeSeconds: number;
  maxStrikes: number;
  strikeCount: number;
  status: string;
  syncVersion: number;
  lastSyncedAt?: number;
  lastServerTime?: number;
}

export class DexieAttemptVault extends Dexie {
  public answers!: Table<VaultAnswerRecord, string>;
  public attemptMeta!: Table<VaultAttemptMeta, string | number>;

  constructor(databaseName = "AksaventraCbtVault") {
    super(databaseName);

    this.version(1).stores({
      answers: "id, attemptId, questionId, synced, updatedAt",
      attemptMeta: "attemptId, examId, status, syncVersion",
    });
  }

  public getCompositeId(
    attemptId: string | number,
    questionId: number,
  ): string {
    return `${attemptId}:${questionId}`;
  }

  public async saveAnswer(
    attemptId: string | number,
    questionId: number,
    answer: string | string[] | Record<string, string> | boolean | number | null,
    flagged = false,
  ): Promise<void> {
    const id = this.getCompositeId(attemptId, questionId);
    await this.answers.put({
      id,
      attemptId,
      questionId,
      answer,
      flagged,
      updatedAt: Date.now(),
      synced: false,
    });
  }

  public async getUnsyncedAnswers(
    attemptId: string | number,
  ): Promise<VaultAnswerRecord[]> {
    return await this.answers
      .where("attemptId")
      .equals(attemptId)
      .filter((rec) => !rec.synced)
      .toArray();
  }

  public async markAnswersAsSynced(
    attemptId: string | number,
    questionIds: number[],
  ): Promise<void> {
    const ids = questionIds.map((qid) => this.getCompositeId(attemptId, qid));
    await this.transaction("rw", this.answers, async () => {
      for (const id of ids) {
        await this.answers.update(id, { synced: true });
      }
    });
  }

  public async getAllAnswers(
    attemptId: string | number,
  ): Promise<VaultAnswerRecord[]> {
    return await this.answers.where("attemptId").equals(attemptId).toArray();
  }

  public async saveAttemptMeta(meta: VaultAttemptMeta): Promise<void> {
    await this.attemptMeta.put(meta);
  }

  public async getAttemptMeta(
    attemptId: string | number,
  ): Promise<VaultAttemptMeta | undefined> {
    return await this.attemptMeta.get(attemptId);
  }

  public async clearAttempt(attemptId: string | number): Promise<void> {
    await this.transaction("rw", this.answers, this.attemptMeta, async () => {
      await this.answers.where("attemptId").equals(attemptId).delete();
      await this.attemptMeta.delete(attemptId);
    });
  }
}

export const vault = new DexieAttemptVault();
