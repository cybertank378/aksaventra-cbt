import { DexieAttemptVault as UnderlyingVault } from "@/libs/dexieVault";
import type { AnswerValue } from "../domain/dto/SyncBatchDTO";
import type {
  LocalVaultInterface,
  VaultRecord,
} from "../domain/interfaces/LocalVaultInterface";

export class DexieAttemptVault implements LocalVaultInterface {
  private readonly vault: UnderlyingVault;

  constructor(vaultName = "AksaventraCbtVault") {
    this.vault = new UnderlyingVault(vaultName);
  }

  public async saveAnswer(
    attemptId: string | number,
    questionId: number,
    answer: AnswerValue,
    flagged = false,
  ): Promise<void> {
    await this.vault.saveAnswer(attemptId, questionId, answer, flagged);
  }

  public async getUnsyncedAnswers(
    attemptId: string | number,
  ): Promise<VaultRecord[]> {
    const raw = await this.vault.getUnsyncedAnswers(attemptId);
    return raw.map((r) => ({
      attemptId: r.attemptId,
      questionId: r.questionId,
      answer: r.answer,
      flagged: r.flagged,
      updatedAt: r.updatedAt,
      synced: r.synced,
    }));
  }

  public async markAnswersAsSynced(
    attemptId: string | number,
    questionIds: number[],
  ): Promise<void> {
    await this.vault.markAnswersAsSynced(attemptId, questionIds);
  }

  public async getAllAnswers(
    attemptId: string | number,
  ): Promise<VaultRecord[]> {
    const raw = await this.vault.getAllAnswers(attemptId);
    return raw.map((r) => ({
      attemptId: r.attemptId,
      questionId: r.questionId,
      answer: r.answer,
      flagged: r.flagged,
      updatedAt: r.updatedAt,
      synced: r.synced,
    }));
  }
}
