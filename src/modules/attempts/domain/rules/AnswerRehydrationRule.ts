import type { AnswerItemDTO } from "../dto/SyncBatchDTO";
import { AnswerRecordEntity } from "../entities/AnswerRecordEntity";

export interface RehydrationResult {
  mergedAnswers: Map<number, AnswerRecordEntity>;
  updatedCount: number;
  ignoredCount: number;
}

/**
 * AnswerRehydrationRule implements Last-Write-Wins (LWW) conflict resolution
 * per questionId based on timestamps (ts).
 *
 * Ensures out-of-order network sync packets never overwrite newer answers.
 */
export class AnswerRehydrationRule {
  public static rehydrate(
    existingAnswers: Map<number, AnswerRecordEntity>,
    incomingAnswers: (AnswerItemDTO | AnswerRecordEntity)[],
  ): RehydrationResult {
    const merged = new Map<number, AnswerRecordEntity>(existingAnswers);
    let updatedCount = 0;
    let ignoredCount = 0;

    for (const incoming of incomingAnswers) {
      const incomingEntity =
        incoming instanceof AnswerRecordEntity
          ? incoming
          : AnswerRecordEntity.fromDTO(incoming);

      const existing = merged.get(incomingEntity.questionId);

      if (!existing) {
        // New answer, insert directly
        merged.set(incomingEntity.questionId, incomingEntity);
        updatedCount++;
      } else if (incomingEntity.timestamp > existing.timestamp) {
        // Newer timestamp, update
        merged.set(incomingEntity.questionId, incomingEntity);
        updatedCount++;
      } else {
        // Older or equal timestamp, ignore (stale packet)
        ignoredCount++;
      }
    }

    return {
      mergedAnswers: merged,
      updatedCount,
      ignoredCount,
    };
  }
}
